import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import {
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { Response } from 'express'

import { ProductDto } from './products.dto'
import { ProductsService } from './products.service'
import { Order, SortBy } from './products.types'

@ApiTags('Products')
@Controller('/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post(':id')
  @ApiResponse({
    status: 201,
    type: ProductDto,
    description: 'Product created',
  })
  @ApiConflictResponse({
    description: 'Product already exists',
  })
  @UsePipes(new ValidationPipe())
  async addProductDocument(
    @Param('id') id: string,
    @Body() body: ProductDto,
    @Res() res: Response,
  ) {
    const productExists = await this.productsService.productExists(id)

    if (productExists) {
      throw new HttpException('Product already exists', HttpStatus.CONFLICT)
    }

    const product = await this.productsService.addProductDocument(
      id,
      body,
      'created',
    )

    return res.status(201).json(product)
  }

  @Patch(':id')
  @ApiOkResponse({
    type: ProductDto,
    description: 'Product patched',
  })
  @UsePipes(new ValidationPipe())
  async updateProduct(
    @Param('id') id: string,
    @Body() body: ProductDto,
    @Res() res: Response,
  ) {
    const product = this.productsService.addProductDocument(id, body, 'updated')

    return res.status(200).json(product)
  }

  @Delete(':id')
  @ApiOkResponse({
    description: 'Product deleted',
  })
  async deleteProduct(@Param('id') id: string) {
    return this.productsService.deleteProduct(id)
  }

  @Get(':id')
  @ApiParam({ name: 'ID', required: true, description: 'Product ID' })
  @ApiOkResponse({
    type: ProductDto,
    description: 'Product found',
  })
  @ApiNotFoundResponse({ description: 'Product not found' })
  async getProduct(@Param('id') id: string) {
    const product = await this.productsService.getProduct(id)
    if (!product) {
      throw new NotFoundException('Product not found')
    }
    return product
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
    description: 'List of products found',
  })
  async listAllProducts(
    @Query('sort-by') sortBy: 'name' | 'price' | 'stock' = 'name',
    @Query('order') order: 'asc' | 'desc' = 'asc',
  ) {
    return this.productsService.listAllProducts(sortBy, order)
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
    return this.productsService.searchProducts(query, sortBy, order)
  }
}
