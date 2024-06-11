import { Module } from '@nestjs/common'
import { SearchModule } from 'src/search/search.module'

import { ProductsController } from '../products/products.controller'
import { ProductsService } from '../products/products.service'

@Module({
  imports: [SearchModule],
  providers: [ProductsService, ProductsController],
  controllers: [ProductsController],
  exports: [ProductsService, ProductsController],
})
export class ProductsModule {}
