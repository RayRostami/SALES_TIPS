import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
  ) {}

  create(company: Partial<Company>) {
    return this.companiesRepository.save(company);
  }

  findAll() {
    return this.companiesRepository.find();
  }
  async remove(id: number): Promise<void> {
      try {
        // First check if agent exists
        const agent = await this.companiesRepository.findOne({ 
          where: { id } 
        });
  
        if (!agent) {
          throw new NotFoundException(`Company with ID ${id} not found`);
        }
  
        // Delete the agent
        await this.companiesRepository.remove(agent);
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }
        console.error('Error removing Company:', error);
        throw new InternalServerErrorException('Error removing Company');
      }
    }
    async update(id: number, companyDto: Company): Promise<Company> {
        const company = await this.findById(id);
        
        // Update the agent with new values
        Object.assign(company, companyDto);
        
        return await this.companiesRepository.save(company);
      }
    async findById(id: number): Promise<Company> {
        const agent = await this.companiesRepository.findOne({ 
          where: { id } 
        });
    
        if (!agent) {
          throw new NotFoundException(`Company with ID ${id} not found`);
        }
    
        return agent;
      }
}