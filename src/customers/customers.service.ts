import {
  AggregationsAggregate,
  QueryDslQueryContainer,
  SearchResponse,
  Sort,
} from '@elastic/elasticsearch/lib/api/types'
import { Injectable } from '@nestjs/common'
import { ElasticsearchService } from '@nestjs/elasticsearch'

import { CustomerDto } from './customers.dto'
import { SearchQueryType } from './customers.types'

const index = 'customers'

@Injectable()
export class CustomersService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async createCustomersIndex(index: string) {
    const exists = await this.elasticsearchService.indices.exists({ index })
    if (!exists) {
      await this.elasticsearchService.indices.create({
        index,
        body: {
          mappings: {
            properties: {
              name: {
                type: 'text',
                fields: {
                  keyword: {
                    type: 'keyword',
                  },
                },
              },
              yield: { type: 'double' },
              purchases: { type: 'integer' },
            },
          },
        },
      })
    }
  }

  async customerExists(id: string) {
    await this.createCustomersIndex(index)

    const customer = await this.getCustomer(id)

    return !!customer
  }

  async addCustomerDocument(
    id: string,
    customer: CustomerDto,
    variant: 'created' | 'updated',
  ): Promise<CustomerDto> {
    const response = await this.elasticsearchService.index({
      index,
      id,
      body: customer,
    })

    if (response.result !== variant) {
      throw new Error('Failed to add customer to Elasticsearch')
    }

    return customer
  }

  async deleteCustomer(id: string) {
    const response = await this.elasticsearchService.delete({
      index,
      id,
    })

    if (response.result !== 'deleted') {
      throw new Error('Failed to delete customer from Elasticsearch')
    }

    return response
  }

  async getCustomer(id: string): Promise<CustomerDto> {
    const results = await this.search({
      match: {
        _id: id,
      },
    })

    return results[0]
  }

  async listAllCustomers(
    sortBy: 'name' | 'yield' | 'purchases',
    order: 'asc' | 'desc',
  ): Promise<CustomerDto[]> {
    const sortField = sortBy === 'name' ? `${sortBy}.keyword` : sortBy
    const sortQuery = {}
    sortQuery[sortField] = { order }

    await this.createCustomersIndex(index)

    return this.search(
      {
        match_all: {},
      },
      sortQuery,
    )
  }

  async searchCustomers(
    query: string,
    sortBy: 'name' | 'yield' | 'purchases',
    order: 'asc' | 'desc',
  ): Promise<CustomerDto[]> {
    const isNumber = !isNaN(Number(query))

    const shouldQuery: SearchQueryType[] = [
      {
        match_phrase_prefix: { name: query },
      },
    ]

    if (isNumber) {
      const rangeQuery = this.createRangeQuery(Number(query))
      shouldQuery.push(rangeQuery.yield, rangeQuery.purchases)
    }

    const sortField = sortBy === 'name' ? `${sortBy}.keyword` : sortBy
    const sortQuery = {}
    sortQuery[sortField] = { order }

    return this.search(
      {
        bool: {
          should: shouldQuery,
          minimum_should_match: 1,
        },
      },
      sortQuery,
    )
  }

  private mapHitsToProducts(
    response: SearchResponse<unknown, Record<string, AggregationsAggregate>>,
  ) {
    return response.hits.hits.map((hit) => ({
      id: hit._id,
      ...(hit._source as CustomerDto),
    }))
  }

  private async search(
    query: QueryDslQueryContainer,
    sort?: Sort,
  ): Promise<CustomerDto[]> {
    const response = await this.elasticsearchService.search({
      index,
      body: {
        query,
        sort: sort,
      },
    })

    return this.mapHitsToProducts(response)
  }

  private createRangeQuery(value: number): {
    yield: SearchQueryType
    purchases: SearchQueryType
  } {
    const range = {
      gte: value,
      lte: value,
    }

    return {
      yield: {
        range: {
          yield: range,
        },
      },
      purchases: {
        range: {
          purchases: range,
        },
      },
    }
  }
}
