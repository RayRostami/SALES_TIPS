import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateContractDto {
    @IsOptional()
    @IsString()
    fundservCode?: string;

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

export class UpdateContractDto extends CreateContractDto {
    
}
