// src/sales/sales.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  HttpStatus,
  HttpCode,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto, SaleSearchParams,UpdateSaleDto} from './create-sale-dto';

import { Sale } from './sales.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@ApiTags('sales')
@Controller('sales')
@UseGuards(AuthGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new sale' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'The sale has been successfully created.', type: Sale  })
  async create(@Body() createSaleDto:any) 
  {   
    return this.salesService.create(createSaleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sales with pagination and sorting' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns paginated sales data', type: Sale, isArray: true })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, type:String })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query('sortBy') sortField?: string,
    @Query('sortOrder') sortOrder?:string) {    
    return this.salesService.findAll({ 
      page, 
      pageSize, 
      sortField, 
      sortOrder 
    });
  }

  @Get('search')
  @ApiOperation({ summary: 'Search sales with filters, pagination, and sorting' })
  @ApiResponse({status: HttpStatus.OK, description: 'Returns filtered and paginated sales data', type: Sale, isArray: true })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'sortField', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, type: String })
  @ApiQuery({ name: 'agentId', required: false, type: Number })
  @ApiQuery({ name: 'payStatusId', required: false, type: Number })
  @ApiQuery({ name: 'fromDate', required: false, type: String })
  @ApiQuery({ name: 'toDate', required: false, type: String })
  @ApiQuery({ name: 'clientName', required: false, type: String })
  @ApiQuery({ name: 'policyNum', required: false, type: String })
  @ApiQuery({ name: 'produtId', required: false, type: Number })
  @ApiQuery({ name: 'companyId', required: false, type: Number })
  async search(
    @Query() searchParams: SaleSearchParams) {  
    return this.salesService.search(searchParams);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a sale by id' })
  @ApiResponse({ status: HttpStatus.OK,description: 'Returns a single sale', type: Sale })
  @ApiResponse({ status: HttpStatus.NOT_FOUND,  description: 'Sale not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.salesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a sale' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The sale has been successfully updated.', type: Sale })
  @ApiResponse({status: HttpStatus.NOT_FOUND,description: 'Sale not found' })
  async update( @Param('id', ParseIntPipe) id: number,  @Body(new ValidationPipe({ transform: true })) updateSaleDto: UpdateSaleDto) {
    return this.salesService.update(id, updateSaleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a sale' })
  @ApiResponse({status: HttpStatus.NO_CONTENT, description: 'The sale has been successfully deleted.' })
  @ApiResponse({status: HttpStatus.NOT_FOUND, description: 'Sale not found' })
  async remove(
    @Param('id', ParseIntPipe) id: number
  ) {
    await this.salesService.remove(id);
  }
}
