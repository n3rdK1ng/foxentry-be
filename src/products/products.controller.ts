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
import {
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'

import { ProductResponseDto } from './products.dto'
import { ProductsService } from './products.service'
import { Order, SortBy } from './products.types'

@ApiTags('Products')
@Controller('/products')
export class ProductsController {
  constructor(private readonly searchService: ProductsService) {}

  @Post(':id')
  @ApiResponse({ status: 201, description: 'Product created' })
  @UsePipes(new ValidationPipe())
  async addProductDocument(
    @Param('id') id: string,
    @Body() body: ProductResponseDto,
  ) {
    const productExists = await this.searchService.productExists(id)

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
  async updateProduct(
    @Param('id') id: string,
    @Body() body: ProductResponseDto,
  ) {
    return this.searchService.addProductDocument(id, body)
  }

  @Delete(':id')
  @ApiOkResponse({
    description: 'Product deleted',
  })
  async deleteProduct(@Param('id') id: string) {
    return this.searchService.deleteProduct(id)
  }

  @Get(':id')
  @ApiParam({ name: 'ID', required: true, description: 'Product ID' })
  @ApiOkResponse({
    type: ProductResponseDto,
    description: 'Product found',
  })
  async getProduct(@Param('id') id: string) {
    return this.searchService.getProduct(id)
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
    type: ProductResponseDto,
    description: 'List of products found',
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
    type: ProductResponseDto,
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
