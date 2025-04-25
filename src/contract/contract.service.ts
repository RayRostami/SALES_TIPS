import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract } from './contract.entity';
import { CreateContractDto, UpdateContractDto } from './contract.dto';
import { CompanyContractView } from './company-contract-view.entity';

@Injectable()
export class ContractService {
    constructor(
        @InjectRepository(Contract)
        private contractRepository: Repository<Contract>,
        private companyContractViewRepository: Repository<CompanyContractView>
    ) {}

    async findAll(): Promise<Contract[]> {
        return await this.contractRepository.find({
            relations: ['company', 'agent', 'status'],
        });
    }

    async findOne(id: number): Promise<Contract> {
        const contract = await this.contractRepository.findOne({
            where: { id },
            relations: ['company', 'agent', 'status'],
        });
        
        if (!contract) {
            throw new NotFoundException(`Contract with ID ${id} not found`);
        }
        
        return contract;
    }

    async create(createContractDto: CreateContractDto): Promise<Contract> {
        const contract = this.contractRepository.create({
            fundservCode: createContractDto.fundservCode,
            company: { id: createContractDto.companyId },
            agent: { id: createContractDto.agentId },
            status: { id: createContractDto.statusId }
        });

        return await this.contractRepository.save(contract);
    }

    async update(id: number, updateContractDto: UpdateContractDto): Promise<Contract> {
        const contract = await this.findOne(id);

        // Only update fields that are provided
        if (updateContractDto.fundservCode !== undefined) {
            contract.fundservCode = updateContractDto.fundservCode;
        }
        if (updateContractDto.companyId !== undefined) {
            contract.company = { id: updateContractDto.companyId } as any;
        }
        if (updateContractDto.agentId !== undefined) {
            contract.agent = { id: updateContractDto.agentId } as any;
        }
        if (updateContractDto.statusId !== undefined) {
            contract.status = { id: updateContractDto.statusId } as any;
        }

        return await this.contractRepository.save(contract);
    }

    async remove(id: number): Promise<void> {
        const result = await this.contractRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Contract with ID ${id} not found`);
        }
    }
    async findAllCompanyContracts(
        agentId: number,
        page: number = 1,
        limit: number = 10,
        search?: string
    ): Promise<{ data: CompanyContractView[]; total: number }> {
        const queryBuilder = this.companyContractViewRepository.createQueryBuilder('cv');
        
        // Always filter by agentId
        queryBuilder.where('cv.agentid = :agentId', { agentId });
    
        // Add search condition if provided
        if (search) {
            queryBuilder.andWhere('cv.company ILIKE :search', { search: `%${search}%` });
        }
        
        const [data, total] = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('cv.company', 'ASC') // Add ordering if needed
            .getManyAndCount();
    
        return { data, total };
    }
    async findCompanyContractById(id: number): Promise<CompanyContractView> {
        const result = await this.companyContractViewRepository.findOne({
            where: { id }
        });
        
        if (!result) {
            throw new NotFoundException(`Company contract with ID ${id} not found`);
        }
        
        return result;
    }
}
