import { Module } from '@nestjs/common'

import { CustomersService } from '../customers/customers.service'
import { OrdersController } from '../orders/orders.controller'
import { OrdersService } from '../orders/orders.service'
import { ProductsService } from '../products/products.service'
import { SearchModule } from '../search/search.module'

@Module({
  imports: [SearchModule],
  providers: [
    OrdersService,
    OrdersController,
    ProductsService,
    CustomersService,
  ],
  controllers: [OrdersController],
  exports: [OrdersService, OrdersController],
})
export class OrdersModule {}
