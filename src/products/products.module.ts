import { Module } from '@nestjs/common'

import { ProductsController } from '../products/products.controller'
import { ProductsService } from '../products/products.service'
import { SearchModule } from '../search/search.module'

@Module({
  imports: [SearchModule],
  providers: [ProductsService, ProductsController],
  controllers: [ProductsController],
  exports: [ProductsService, ProductsController],
})
export class ProductsModule {}
