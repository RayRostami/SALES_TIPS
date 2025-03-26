import { Controller, Get, Post, Body, Delete, Param, ParseIntPipe, HttpCode, HttpStatus, Put, UseGuards } from '@nestjs/common';
import { ProductsService } from './product.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('products')
@UseGuards(AuthGuard)
export class ProductsController {
  constructor(private productsService: ProductsService) {}
@Post()
  create(@Body() product: any) {
    return this.productsService.create(product);
  }
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() product: any) {    
      return this.productsService.update(id, product);
  }
  @Get()
  findAll() {
    return this.productsService.findAll();
  }
  @Get(':id')
  findById(@Param('id', new ParseIntPipe()) id: number) {
      return this.productsService.findById(id);
  }
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', new ParseIntPipe()) id: number): Promise<void> {    
      await this.productsService.remove(id);
  }
}