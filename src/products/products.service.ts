import { Injectable } from '@nestjs/common'
import { ElasticsearchService } from '@nestjs/elasticsearch'

import { ProductDto } from './products.dto'

type Product = ProductDto

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
    const products = await this.search(name)
    return products.length > 0
  }

  async addProductDocument(id: string, product: Product): Promise<any> {
    const index = 'products'

    await this.createProductsIndex(index)

    return this.elasticsearchService.index({
      index,
      id,
      body: product,
    })
  }

  async deleteProduct(id: string): Promise<any> {
    const index = 'products'

    return this.elasticsearchService.delete({
      index,
      id,
    })
  }

  async search(query: string): Promise<Product[]> {
    const index = 'products'

    const response = await this.elasticsearchService.search({
      index,
      body: {
        query: {
          match: {
            name: query,
          },
        },
      },
    })

    return response.hits.hits.map((hit) => hit._source as Product)
  }

  async listAllProducts(): Promise<Product[]> {
    const index = 'products'

    const response = await this.elasticsearchService.search({
      index,
      body: {
        query: {
          match_all: {},
        },
      },
    })

    return response.hits.hits.map((hit) => hit._source as Product)
  }
}
