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
import { ApiQuery } from '@nestjs/swagger'
import { ApiOkResponse, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'

import { ProductDto } from './products.dto'
import { ProductsService } from './products.service'
import { Order, SortBy } from './products.types'

@ApiTags('Products')
@Controller('/products')
export class ProductsController {
  constructor(private readonly searchService: ProductsService) {}

  @Post(':id')
  @ApiResponse({ status: 201, description: 'Product created' })
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
  @ApiOkResponse({
    description: 'Product patched',
  })
  @UsePipes(new ValidationPipe())
  async updateProduct(@Param('id') id: string, @Body() body: ProductDto) {
    return this.searchService.addProductDocument(id, body)
  }

  @Delete(':id')
  @ApiOkResponse({
    description: 'Product deleted',
  })
  async deleteProduct(@Param('id') id: string) {
    return this.searchService.deleteProduct(id)
  }

  @Get(':query')
  @ApiParam({ name: 'query', required: true, description: 'Product query' })
  @ApiOkResponse({
    type: ProductDto,
    description: 'Product found',
  })
  async getProduct(@Param('query') query: string) {
    return this.searchService.getProduct(query)
  }

  @Get()
  @ApiQuery({
    name: 'sort-by',
    required: false,
    description: 'Sort by field',
    enum: SortBy,
  })
  @ApiQuery({
    name: 'order',
    required: false,
    description: 'Order',
    enum: Order,
  })
  @ApiOkResponse({
    type: ProductDto,
    description: 'List of products founds',
  })
  async listAllProducts(
    @Query('sort-by') sortBy: 'name' | 'price' | 'stock' = 'name',
    @Query('order') order: 'asc' | 'desc' = 'asc',
  ) {
    return this.searchService.listAllProducts(sortBy, order)
  }

  @Get('/search/:query')
  @ApiParam({ name: 'query', required: true, description: 'Search query' })
  @ApiQuery({
    name: 'sort-by',
    required: false,
    description: 'Sort by field',
    enum: SortBy,
  })
  @ApiQuery({
    name: 'order',
    required: false,
    description: 'Order',
    enum: Order,
  })
  @ApiOkResponse({
    type: ProductDto,
    description: 'List of products found',
  })
  async searchProducts(
    @Param('query') query: string,
    @Query('sort-by') sortBy: 'name' | 'price' | 'stock' = 'name',
    @Query('order') order: 'asc' | 'desc' = 'asc',
  ) {
    return this.searchService.searchProducts(query, sortBy, order)
  }
}
