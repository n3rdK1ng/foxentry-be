import {
  AggregationsAggregate,
  QueryDslQueryContainer,
  SearchResponse,
  Sort,
} from '@elastic/elasticsearch/lib/api/types'
import { Injectable } from '@nestjs/common'
import { ElasticsearchService } from '@nestjs/elasticsearch'

import { OrderDto } from './orders.dto'
import { Order, SearchQueryType, SortBy } from './orders.types'

const index = 'orders'

@Injectable()
export class OrdersService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async createOrdersIndex(index: string) {
    const exists = await this.elasticsearchService.indices.exists({ index })
    if (!exists) {
      await this.elasticsearchService.indices.create({
        index,
        body: {
          mappings: {
            properties: {
              productName: {
                type: 'text',
                fields: {
                  keyword: {
                    type: 'keyword',
                  },
                },
              },
              productId: {
                type: 'keyword',
              },
              customerName: {
                type: 'text',
                fields: {
                  keyword: {
                    type: 'keyword',
                  },
                },
              },
              customerId: {
                type: 'keyword',
              },
              price: { type: 'double' },
              amount: { type: 'integer' },
            },
          },
        },
      })
    }
  }

  async orderExists(id: string) {
    await this.createOrdersIndex(index)

    const order = await this.getOrder(id)

    return !!order
  }

  async addOrderDocument(id: string, order: OrderDto): Promise<OrderDto> {
    const response = await this.elasticsearchService.index({
      index,
      id,
      body: order,
    })

    if (response.result !== 'created') {
      throw new Error('Failed to add order to Elasticsearch')
    }

    return order
  }

  async getOrder(id: string): Promise<OrderDto> {
    const results = await this.search({
      match: {
        _id: id,
      },
    })

    return results[0]
  }

  async listAllOrders(
    sortBy: SortBy,
    order: Order,
    variant?: 'productId' | 'customerId',
    id?: string,
  ): Promise<OrderDto[]> {
    const sortField =
      sortBy === SortBy.PRODUCT_NAME || sortBy === SortBy.CUSTOMER_NAME
        ? `${sortBy}.keyword`
        : sortBy
    const sortQuery = {}
    sortQuery[sortField] = { order }

    await this.createOrdersIndex(index)

    const searchQuery =
      variant && id ? { match: { [variant]: id } } : { match_all: {} }

    return this.search(searchQuery, sortQuery)
  }

  async searchOrders(
    query: string,
    sortBy: SortBy,
    order: Order,
    variant?: 'productId' | 'customerId',
    id?: string,
  ): Promise<OrderDto[]> {
    const isNumber = !isNaN(Number(query))

    const shouldQuery: SearchQueryType[] = [
      {
        match_phrase_prefix: { productName: query },
      },
      {
        match_phrase_prefix: { customerName: query },
      },
    ]

    if (isNumber) {
      const rangeQuery = this.createRangeQuery(Number(query))
      shouldQuery.push(rangeQuery.price, rangeQuery.amount)
    }

    const sortField =
      sortBy === SortBy.PRODUCT_NAME || sortBy === SortBy.CUSTOMER_NAME
        ? `${sortBy}.keyword`
        : sortBy
    const sortQuery = {}
    sortQuery[sortField] = { order }

    const searchQuery = {
      bool: {
        should: shouldQuery,
        minimum_should_match: 1,
        filter: variant && id ? [{ term: { [variant]: id } }] : [],
      },
    }

    return this.search(searchQuery, sortQuery)
  }

  private mapHitsToOrders(
    response: SearchResponse<unknown, Record<string, AggregationsAggregate>>,
  ) {
    return response.hits.hits.map((hit) => ({
      id: hit._id,
      ...(hit._source as OrderDto),
    }))
  }

  private async search(
    query: QueryDslQueryContainer,
    sort?: Sort,
  ): Promise<OrderDto[]> {
    const response = await this.elasticsearchService.search({
      index,
      body: {
        query,
        sort: sort,
      },
    })

    return this.mapHitsToOrders(response)
  }

  private createRangeQuery(value: number): {
    price: SearchQueryType
    amount: SearchQueryType
  } {
    const range = {
      gte: value,
      lte: value,
    }

    return {
      price: {
        range: {
          price: range,
        },
      },
      amount: {
        range: {
          amount: range,
        },
      },
    }
  }
}
