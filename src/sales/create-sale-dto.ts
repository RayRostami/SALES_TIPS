// src/sales/dto/create-sale.dto.ts
import { IsNotEmpty, IsNumber, IsDate, IsOptional, IsString, isNotEmpty } from 'class-validator';

export class CreateSaleDto {
  @IsNotEmpty()
  @IsDate()
  salesDate: Date;

  @IsNotEmpty()
  @IsNumber()
  salesAmount: number;

  @IsOptional()
  @IsNumber()
  coverage?: number;

  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @IsNotEmpty()
  @IsNumber()
  companyId: number;

  @IsNotEmpty()
  @IsNumber()
  agentId: number;

  @IsNotEmpty()
  @IsNumber()
  payStatusId: number;

  @IsNotEmpty()
  @IsString()
  clientName: string;

  @IsNotEmpty()
  @IsString()
  policyNum: string;
  
  @IsString()
  note?: string;
}


import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
export class UpdateSaleDto extends PartialType(CreateSaleDto) {}
export class SaleSearchParams {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number ;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pageSize?: number ;

  @IsOptional()
  @IsString()
  sortField?: string;

  @IsOptional()
  @IsString()
  sortOrder?: string ;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  agentId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  payStatusId?: number;

  @IsOptional()
  @Type(() => Date)
  fromDate?: Date;

  @IsOptional()
  @Type(() => Date)
  toDate?: Date;

  @IsOptional()
  @IsString()
  policyNum?: string;

  @IsOptional()
  @IsString()
  clientName?: string;

  @IsOptional()
  @IsNumber()
  productId?: number;

  @IsOptional()
  @IsNumber()
  companyId?: number;
}
