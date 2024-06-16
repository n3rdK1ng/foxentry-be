import type {
  AggregationsAggregate,
  QueryDslQueryContainer,
  SearchResponse,
  Sort,
} from '@elastic/elasticsearch/lib/api/types'
import { Injectable } from '@nestjs/common'
import { ElasticsearchService } from '@nestjs/elasticsearch'

import type { ProductDto } from './products.dto'
import type { SearchQueryType } from './products.types'

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

  async productExists(id: string) {
    await this.createProductsIndex(index)

    const product = await this.getProduct(id)

    return !!product
  }

  async addProductDocument(
    id: string,
    product: ProductDto,
    variant: 'created' | 'updated',
  ): Promise<ProductDto> {
    const response = await this.elasticsearchService.index({
      index,
      id,
      body: product,
    })

    if (response.result !== variant) {
      throw new Error('Failed to add product to Elasticsearch')
    }

    return product
  }

  async deleteProduct(id: string) {
    const response = await this.elasticsearchService.delete({
      index,
      id,
    })

    if (response.result !== 'deleted') {
      throw new Error('Failed to delete product from Elasticsearch')
    }

    return response
  }

  async getProduct(id: string): Promise<ProductDto> {
    const results = await this.search({
      match: {
        _id: id,
      },
    })

    return results[0]
  }

  async listAllProducts(
    sortBy: 'name' | 'price' | 'stock',
    order: 'asc' | 'desc',
  ): Promise<ProductDto[]> {
    const sortField = sortBy === 'name' ? `${sortBy}.keyword` : sortBy
    const sortQuery = {}
    sortQuery[sortField] = { order }

    await this.createProductsIndex(index)

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
  ): Promise<ProductDto[]> {
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
    return response.hits.hits.map((hit) => ({
      id: hit._id,
      ...(hit._source as ProductDto),
    }))
  }

  private async search(
    query: QueryDslQueryContainer,
    sort?: Sort,
  ): Promise<ProductDto[]> {
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
