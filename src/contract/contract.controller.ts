import { 
    Controller, 
    Get, 
    Post, 
    Put, 
    Delete, 
    Body, 
    Param, 
    ParseIntPipe,
    ValidationPipe, 
    Query,
    DefaultValuePipe
} from '@nestjs/common';
import { ContractService } from './contract.service';
import { Contract } from './contract.entity';
import { CreateContractDto, UpdateContractDto } from './contract.dto';
import { CompanyContractView } from './company-contract-view.entity';

@Controller('contracts')
export class ContractController {
    constructor(private readonly contractService: ContractService) {}

    @Get()
    async findAll(): Promise<Contract[]> {
        return await this.contractService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<Contract> {
        return await this.contractService.findOne(id);
    }

    @Post()
    async create(
        @Body(ValidationPipe) createContractDto: CreateContractDto
    ): Promise<Contract> {
        return await this.contractService.create(createContractDto);
    }

    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body(ValidationPipe) updateContractDto: UpdateContractDto
    ): Promise<Contract> {
        return await this.contractService.update(id, updateContractDto);
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return await this.contractService.remove(id);
    }

    @Get('company-contracts/:id')
    async findCompanyContractById(
        @Param('id', ParseIntPipe) id: number
    ): Promise<CompanyContractView> {
        return await this.contractService.findCompanyContractById(id);
    }

    @Get('company-contracts/:agentId')
    async findAllCompanyContracts(
        @Param('agentId', ParseIntPipe) agentId: number,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Query('search') search?: string
    ) {
        return await this.contractService.findAllCompanyContracts(agentId, page, limit, search);
    }
    
}
