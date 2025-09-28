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
  UseGuards,
} from '@nestjs/common';
import { ContractService } from './contract.service';
import { Contract } from './contract.entity';
import { CreateContractDto, UpdateContractDto } from './contract.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('contracts')
@UseGuards(AuthGuard)
export class ContractController {
  constructor(private readonly contractService: ContractService) {}
  @Get('companycontract')
  async findCompanyContracts(
    @Query('companyId', ParseIntPipe) companyId: number,
    @Query('agentId', ParseIntPipe) agentId: number,
  ) {
    return await this.contractService.findCompanyContract(companyId, agentId);
  }

  @Get()
  async findAll(): Promise<Contract[]> {
    return await this.contractService.findAll();
  }

  @Get('agent/:agentId')
  async findAgentContracts(
    @Param('agentId', ParseIntPipe) agentId: number,
  ): Promise<Contract[]> {
    return await this.contractService.findByAgentId(agentId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Contract> {
    return await this.contractService.findOne(id);
  }
  @Post()
  async create(
    @Body(ValidationPipe) createContractDto: CreateContractDto,
  ): Promise<Contract> {
    return await this.contractService.create(createContractDto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateContractDto: UpdateContractDto,
  ): Promise<Contract> {
    return await this.contractService.update(id, updateContractDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.contractService.remove(id);
  }
}
