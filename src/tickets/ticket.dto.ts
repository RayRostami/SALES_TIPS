import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNotEmpty,
  MaxLength,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export class CreateTicketDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  ticketTypeId: number;

  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: string;

  @IsNumber()
  @IsOptional()
  assignedTo?: number;

  @IsNumber()
  @IsOptional()
  companyId?: number;
}

export class UpdateTicketDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  ticketTypeId?: number;

  @IsNumber()
  @IsOptional()
  statusId?: number;

  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: string;

  @IsNumber()
  @IsOptional()
  assignedTo?: number;

  @IsNumber()
  @IsOptional()
  companyId?: number;
}

export class AssignTicketDto {
  @IsNumber()
  assignedTo: number;
}

export class AddCommentDto {
  @IsString()
  comment: string;

  @IsBoolean()
  @IsOptional()
  isInternal?: boolean;
}

export class TicketQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  statusId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  ticketTypeId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  assignedTo?: number;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}

export class CreateTicketTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateTicketTypeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
