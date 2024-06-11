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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { ProductDto } from './products.dto';
import { ProductsService } from './products.service';

@Controller('/products')
export class ProductsController {
  constructor(private readonly searchService: ProductsService) {}

  @Get()
  async listAllProducts() {
    return this.searchService.listAllProducts();
  }

  @Post(':id')
  @UsePipes(new ValidationPipe())
  async addProductDocument(@Param('id') id: string, @Body() body: ProductDto) {
    const productExists = await this.searchService.productExists(body.name);

    if (productExists) {
      throw new HttpException('Product already exists', HttpStatus.CONFLICT);
    }

    return this.searchService.addProductDocument(id, body);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  async updateProduct(@Param('id') id: string, @Body() body: ProductDto) {
    return this.searchService.addProductDocument(id, body);
  }

  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    return this.searchService.deleteProduct(id);
  }

  @Get(':query')
  async search(@Param('query') query: string) {
    return this.searchService.search(query);
  }
}