import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'

import { ProductDto } from './products.dto'
import { ProductsService } from './products.service'

@Controller('/products')
export class ProductsController {
  constructor(private readonly searchService: ProductsService) {}

  @Post(':id')
  @UsePipes(new ValidationPipe())
  async addProductDocument(@Param('id') id: string, @Body() body: ProductDto) {
    if (id !== body.name) {
      throw new HttpException(
        'ID must be the same as product name',
        HttpStatus.BAD_REQUEST,
      )
    }

    const productExists = await this.searchService.productExists(body.name)

    if (productExists) {
      throw new HttpException('Product already exists', HttpStatus.CONFLICT)
    }

    return this.searchService.addProductDocument(id, body)
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  async updateProduct(@Param('id') id: string, @Body() body: ProductDto) {
    return this.searchService.addProductDocument(id, body)
  }

  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    return this.searchService.deleteProduct(id)
  }

  @Get(':query')
  async getProduct(@Param('query') query: string) {
    return this.searchService.getProduct(query)
  }

  @Get()
  async listAllProducts(
    @Query('sort-by') sortBy: 'name' | 'price' | 'stock' = 'name',
    @Query('order') order: 'asc' | 'desc' = 'asc',
  ) {
    return this.searchService.listAllProducts(sortBy, order)
  }

  @Get('/search/:query')
  async searchProducts(
    @Param('query') query: string,
    @Query('sort-by') sortBy: 'name' | 'price' | 'stock' = 'name',
    @Query('order') order: 'asc' | 'desc' = 'asc',
  ) {
    return this.searchService.searchProducts(query, sortBy, order)
  }
}
