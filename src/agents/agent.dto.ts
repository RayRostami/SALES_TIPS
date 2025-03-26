// src/agents/dto/agent.dto.ts
import { IsString, IsEmail, IsBoolean, IsOptional, IsNumber } from 'class-validator';

export class CreateAgentDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  fanCode: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  role: number;
}

export class UpdateAgentDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  password?: string;
  
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  fanCode?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
