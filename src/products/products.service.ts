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
              name: { type: 'text' },
              price: { type: 'double' },
              stock: { type: 'integer' },
            },
          },
        },
      })
    }
  }

  async productExists(name: string): Promise<boolean> {
    const products = await this.getProduct(name)
    return products.length > 0
  }

  async addProductDocument(id: string, product: Product): Promise<any> {
    await this.createProductsIndex(index)

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

  async getProduct(query: string): Promise<Product[]> {
    return this.search({
      match: {
        name: query,
      },
    })
  }

  async listAllProducts(): Promise<Product[]> {
    return this.search({
      match_all: {},
    })
  }

  async searchProducts(query: string): Promise<Product[]> {
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

    return this.search({
      bool: {
        should: shouldQuery,
        minimum_should_match: 1,
      },
    })
  }

  private mapHitsToProducts(response: any): Product[] {
    return response.hits.hits.map((hit: any) => hit._source as Product)
  }

  private async search(query: any): Promise<Product[]> {
    const response = await this.elasticsearchService.search({
      index,
      body: {
        query,
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
