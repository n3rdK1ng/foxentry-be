import type {
  AggregationsAggregate,
  QueryDslQueryContainer,
  SearchResponse,
  Sort,
} from '@elastic/elasticsearch/lib/api/types'
import { Injectable } from '@nestjs/common'
import { ElasticsearchService } from '@nestjs/elasticsearch'

import type { Product, SearchQueryType } from './products.types'

const index = 'products'

@Injectable()
export class ProductsService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async createProductsIndex(index: string) {
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
              price: { type: 'double' },
              stock: { type: 'integer' },
            },
          },
        },
      })
    }
  }

  async productExists(name: string): Promise<boolean> {
    await this.createProductsIndex(index)

    const product = await this.getProduct(name)
    return product !== null
  }

  async addProductDocument(id: string, product: Product): Promise<any> {
    return this.elasticsearchService.index({
      index,
      id,
      body: product,
    })
  }

  async deleteProduct(id: string): Promise<any> {
    return this.elasticsearchService.delete({
      index,
      id,
    })
  }

  async getProduct(query: string): Promise<Product> {
    const results = await this.search({
      match: {
        name: query,
      },
    })

    return results[0]
  }

  async listAllProducts(
    sortBy: 'name' | 'price' | 'stock',
    order: 'asc' | 'desc',
  ): Promise<Product[]> {
    const sortField = sortBy === 'name' ? `${sortBy}.keyword` : sortBy
    const sortQuery = {}
    sortQuery[sortField] = { order }

    return this.search(
      {
        match_all: {},
      },
      sortQuery,
    )
  }

  async searchProducts(
    query: string,
    sortBy: 'name' | 'price' | 'stock',
    order: 'asc' | 'desc',
  ): Promise<Product[]> {
    const isNumber = !isNaN(Number(query))

    const shouldQuery: SearchQueryType[] = [
      {
        match_phrase_prefix: { name: query },
      },
    ]

    if (isNumber) {
      const rangeQuery = this.createRangeQuery(Number(query))
      shouldQuery.push(rangeQuery.price, rangeQuery.stock)
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
    return response.hits.hits.map((hit) => hit._source as Product)
  }

  private async search(
    query: QueryDslQueryContainer,
    sort?: Sort,
  ): Promise<Product[]> {
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
    price: SearchQueryType
    stock: SearchQueryType
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
      stock: {
        range: {
          stock: range,
        },
      },
    }
  }
}
