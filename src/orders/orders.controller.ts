import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { Response } from 'express'

import { CustomersService } from '../customers/customers.service'
import { ProductsService } from '../products/products.service'
import { OrderDto } from './orders.dto'
import { OrdersService } from './orders.service'
import { Order, SortBy } from './orders.types'

@ApiTags('Orders')
@Controller('/orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly productsService: ProductsService,
    private readonly customersService: CustomersService,
  ) {}

  @Post(':id')
  @ApiResponse({
    status: 201,
    type: OrderDto,
    description: 'Order created',
  })
  @ApiConflictResponse({
    description: 'Order already exists',
  })
  @ApiNotFoundResponse({
    description: 'Product or Customer not found',
  })
  @ApiBadRequestResponse({
    description: 'Insufficient stock',
  })
  @UsePipes(new ValidationPipe())
  async addOrderDocument(
    @Param('id') id: string,
    @Body() body: OrderDto,
    @Res() res: Response,
  ) {
    const orderExists = await this.ordersService.orderExists(id)
    const productExists = await this.productsService.productExists(
      body.productId,
    )
    const customerExists = await this.customersService.customerExists(
      body.customerId,
    )

    if (orderExists) {
      throw new HttpException('Order already exists', HttpStatus.CONFLICT)
    }

    if (!productExists) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND)
    }

    if (!customerExists) {
      throw new HttpException('Customer not found', HttpStatus.NOT_FOUND)
    }

    const currentProduct = await this.productsService.getProduct(body.productId)
    if (body.amount > currentProduct.stock) {
      throw new HttpException('Insufficient stock', HttpStatus.BAD_REQUEST)
    }

    const order = await this.ordersService.addOrderDocument(id, body)

    await this.productsService.addProductDocument(
      currentProduct.id,
      {
        ...currentProduct,
        stock: currentProduct.stock - body.amount,
      },
      'updated',
    )

    const currentCustomer = await this.customersService.getCustomer(
      body.customerId,
    )
    await this.customersService.addCustomerDocument(
      currentCustomer.id,
      {
        ...currentCustomer,
        yield: currentCustomer.yield + currentProduct.price * body.amount,
        purchases: currentCustomer.purchases + 1,
      },
      'updated',
    )

    return res.status(201).json(order)
  }

  @Get(':id')
  @ApiParam({ name: 'ID', required: true, description: 'Order ID' })
  @ApiOkResponse({
    type: OrderDto,
    description: 'Order found',
  })
  @ApiNotFoundResponse({ description: 'Order not found' })
  async getOrder(@Param('id') id: string) {
    const order = await this.ordersService.getOrder(id)
    if (!order) {
      throw new NotFoundException('Order not found')
    }
    return order
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
    type: OrderDto,
    description: 'List of orders found',
  })
  async listAllOrders(
    @Query('sort-by')
    sortBy: SortBy = SortBy.PRODUCT_NAME,
    @Query('order') order: Order = Order.ASC,
  ) {
    return this.ordersService.listAllOrders(sortBy, order)
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
    type: OrderDto,
    description: 'List of orders found',
  })
  async searchOrders(
    @Param('query') query: string,
    @Query('sort-by')
    sortBy: SortBy = SortBy.PRODUCT_NAME,
    @Query('order') order: Order = Order.ASC,
  ) {
    return this.ordersService.searchOrders(query, sortBy, order)
  }

  @Get('/search/:variant/:id/:query')
  @ApiParam({
    name: 'variant',
    required: true,
    description: 'ID Variant',
    enum: ['productId', 'customerId'],
  })
  @ApiParam({ name: 'id', required: true, description: 'ID' })
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
    type: OrderDto,
    description: 'List of orders found',
  })
  async searchByFixedId(
    @Param('variant') variant: 'productId' | 'customerId',
    @Param('id') id: string,
    @Param('query') query: string,
    @Query('sort-by') sortBy: SortBy = SortBy.PRODUCT_NAME,
    @Query('order') order: Order = Order.ASC,
  ) {
    return this.ordersService.searchByFixedId(variant, id, query, sortBy, order)
  }
}
