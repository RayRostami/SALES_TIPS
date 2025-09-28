import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract } from './contract.entity';
import { CreateContractDto, UpdateContractDto } from './contract.dto';
import { MailService } from 'src/mail/mail.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ContractService {
  constructor(
    @InjectRepository(Contract)
    private contractRepository: Repository<Contract>,
    private mailService: MailService,
    private configService: ConfigService,
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
    // Check if a contract already exists for this agent and company
    const existingContract = await this.findCompanyContract(
      createContractDto.companyId,
      createContractDto.agentId,
    );

    if (existingContract) {
      throw new ConflictException(
        `A contract already exists between agent ID ${createContractDto.agentId} and company ID ${createContractDto.companyId}`,
      );
    }

    // Create new contract if no existing one found
    const contract = this.contractRepository.create({
      contractCode: createContractDto.contractCode,
      company: { id: createContractDto.companyId },
      agent: { id: createContractDto.agentId },
      status: { id: createContractDto.statusId },
    });

    // Save the contract
    const savedContract = await this.contractRepository.save(contract);

    // Load the full contract with relations to get company and agent names
    const fullContract = await this.contractRepository.findOne({
      where: { id: savedContract.id },
      relations: ['company', 'agent', 'status'],
    });

    // Send email notification to admin
    try {
      const adminEmail =
        this.configService.get<string>('ADMIN_EMAIL') || 'admin@tipservices.ca';
      const dashboardUrl =
        this.configService.get<string>('ADMIN_DASHBOARD_URL') ||
        'https://tipsadvisors.tipservices.ca/';

      await this.mailService.sendMail({
        to: adminEmail,
        subject: 'New Contract Request',
        template: 'contract-request',
        context: {
          agentName: `${fullContract?.agent.firstName} ${fullContract?.agent.lastName}`,
          companyName: fullContract?.company.company,
          requestDate: new Date().toLocaleDateString(),
          adminDashboardLink: dashboardUrl,
          currentYear: new Date().getFullYear(),
        },
      });

      console.log('Contract request notification email sent to admin');
    } catch (error) {
      console.error(
        'Failed to send contract request notification email:',
        error,
      );
    }

    return savedContract;
  }

  async update(
    id: number,
    updateContractDto: UpdateContractDto,
  ): Promise<Contract> {
    const contract = await this.findOne(id);

    // Only update fields that are provided
    if (updateContractDto.contractCode !== undefined) {
      contract.contractCode = updateContractDto.contractCode;
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

  async findCompanyContract(companyId: number, agentId: number): Promise<any> {
    try {
      // Use createQueryBuilder instead of findOne
      const contract = await this.contractRepository
        .createQueryBuilder('contract')
        .leftJoinAndSelect('contract.company', 'company')
        .leftJoinAndSelect('contract.agent', 'agent')
        .leftJoinAndSelect('contract.status', 'status')
        .where('company.id = :companyId', { companyId })
        .andWhere('agent.id = :agentId', { agentId })
        .getOne();

      return contract;
    } catch (error) {
      console.error('Error in findCompanyContract:', error);
      throw error;
    }
  }

  async findByAgentId(agentId: number): Promise<Contract[]> {
    try {
      const contracts = await this.contractRepository
        .createQueryBuilder('contract')
        .leftJoinAndSelect('contract.company', 'company')
        .leftJoinAndSelect('contract.agent', 'agent')
        .leftJoinAndSelect('contract.status', 'status')
        .where('agent.id = :agentId', { agentId })
        .getMany();

      return contracts;
    } catch (error) {
      console.error('Error in findByAgentId:', error);
      throw error;
    }
  }
}
