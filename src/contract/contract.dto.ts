import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateContractDto {
  @IsOptional()
  @IsString()
  contractCode?: string;

  @IsNotEmpty()
  @IsNumber()
  companyId: number;

  @IsNotEmpty()
  @IsNumber()
  agentId: number;

  @IsNotEmpty()
  @IsNumber()
  statusId: number;
}

export class UpdateContractDto extends CreateContractDto {}
