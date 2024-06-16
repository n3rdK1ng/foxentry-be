import {
  Body,
  Controller,
  Delete,
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
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { Response } from 'express'

import { CustomerDto } from './customers.dto'
import { CustomersService } from './customers.service'
import { Order, SortBy } from './customers.types'

@ApiTags('Customers')
@Controller('/customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post(':id')
  @ApiResponse({
    status: 201,
    type: CustomerDto,
    description: 'Customer created',
  })
  @ApiConflictResponse({
    description: 'Customer already exists',
  })
  @UsePipes(new ValidationPipe())
  async addCustomerDocument(
    @Param('id') id: string,
    @Body() body: CustomerDto,
    @Res() res: Response,
  ) {
    const customerExists = await this.customersService.customerExists(id)

    if (customerExists) {
      throw new HttpException('Customer already exists', HttpStatus.CONFLICT)
    }

    const customer = await this.customersService.addCustomerDocument(
      id,
      body,
      'created',
    )

    return res.status(201).json(customer)
  }

  @Delete(':id')
  @ApiOkResponse({
    description: 'Customer deleted',
  })
  async deleteCustomer(@Param('id') id: string) {
    return this.customersService.deleteCustomer(id)
  }

  @Get(':id')
  @ApiParam({ name: 'ID', required: true, description: 'Customer ID' })
  @ApiOkResponse({
    type: CustomerDto,
    description: 'Customer found',
  })
  @ApiNotFoundResponse({ description: 'Customer not found' })
  async getCustomer(@Param('id') id: string) {
    const customer = await this.customersService.getCustomer(id)
    if (!customer) {
      throw new NotFoundException('Customer not found')
    }
    return customer
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
    type: CustomerDto,
    description: 'List of customers found',
  })
  async listAllCustomers(
    @Query('sort-by') sortBy: 'name' | 'yield' | 'purchases' = 'name',
    @Query('order') order: 'asc' | 'desc' = 'asc',
  ) {
    return this.customersService.listAllCustomers(sortBy, order)
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
    type: CustomerDto,
    description: 'List of customers found',
  })
  async searchCustomers(
    @Param('query') query: string,
    @Query('sort-by') sortBy: 'name' | 'yield' | 'purchases' = 'name',
    @Query('order') order: 'asc' | 'desc' = 'asc',
  ) {
    return this.customersService.searchCustomers(query, sortBy, order)
  }
}
