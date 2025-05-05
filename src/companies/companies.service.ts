import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
  ) { }

  async create(company: Partial<Company>) {
    try {
      const existingAgent = await this.companiesRepository.findOne({
        where: { company: company.company }
      });

      if (existingAgent) {
        throw new ConflictException(`Company: ${company.company} already exists.`);
      }      
      const newCompany = this.companiesRepository.create(company);
      const savedCompany = await this.companiesRepository.save(newCompany);
      return savedCompany;
    }
    catch (error) {
      console.error('Error creating company:', error);
      throw new Error('Error creating company');
    }
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
    const company = await this.companiesRepository.findOne({
      where: { id }
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    return company;
  }
}