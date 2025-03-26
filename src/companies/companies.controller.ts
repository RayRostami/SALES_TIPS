import { Controller, Get, Post, Body, Param, ParseIntPipe, Delete, HttpStatus, HttpCode, Put, UseGuards } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('companies')
@UseGuards(AuthGuard)
export class CompaniesController {
  constructor(private companiesService: CompaniesService) {}

  @Post()
  create(@Body() company: any) {   
    return this.companiesService.create(company);
  }
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() company: any) {   
      return this.companiesService.update(id, company);
  }
  @Get()
  findAll() {
    return this.companiesService.findAll();
  }
  @Get(':id')
  findById(@Param('id', new ParseIntPipe()) id: number) {
      return this.companiesService.findById(id);
  }
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', new ParseIntPipe()) id: number): Promise<void> {      
      await this.companiesService.remove(id);
  }
}