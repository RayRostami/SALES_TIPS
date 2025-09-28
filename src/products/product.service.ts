import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  create(company: Partial<Product>) {
    return this.productsRepository.save(company);
  }

  findAll() {
    return this.productsRepository.find();
  }
  async remove(id: number): Promise<void> {
    try {
      // First check if agent exists
      const agent = await this.productsRepository.findOne({
        where: { id },
      });

      if (!agent) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      // Delete the agent
      await this.productsRepository.remove(agent);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error removing Company:', error);
      throw new InternalServerErrorException('Error removing Company');
    }
  }
  async update(id: number, companyDto: Product): Promise<Product> {
    const company = await this.findById(id);

    // Update the agent with new values
    Object.assign(company, companyDto);

    return await this.productsRepository.save(company);
  }
  async findById(id: number): Promise<Product> {
    const agent = await this.productsRepository.findOne({
      where: { id },
    });

    if (!agent) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return agent;
  }
}
