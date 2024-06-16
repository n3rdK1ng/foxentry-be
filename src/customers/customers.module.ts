import { Module } from '@nestjs/common'

import { CustomersController } from '../customers/customers.controller'
import { CustomersService } from '../customers/customers.service'
import { SearchModule } from '../search/search.module'

@Module({
  imports: [SearchModule],
  providers: [CustomersService, CustomersController],
  controllers: [CustomersController],
  exports: [CustomersService, CustomersController],
})
export class CustomersModule {}
