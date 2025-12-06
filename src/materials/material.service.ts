import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from './material.entity';

@Injectable()
export class MaterialsService {
  constructor(
    @InjectRepository(Material)
    private materialsRepository: Repository<Material>,
  ) {}

  create(material: Partial<Material>) {
    return this.materialsRepository.save(material);
  }

  findAll() {
    return this.materialsRepository.find();
  }

  async findById(id: number): Promise<Material> {
    const material = await this.materialsRepository.findOne({
      where: { metrialId: id },
    });

    if (!material) {
      throw new NotFoundException(`Material with ID ${id} not found`);
    }

    return material;
  }

  async update(id: number, materialDto: Partial<Material>): Promise<Material> {
    const material = await this.findById(id);

    // Update the material with new values
    Object.assign(material, materialDto);

    return await this.materialsRepository.save(material);
  }

  async remove(id: number): Promise<void> {
    try {
      // First check if material exists
      const material = await this.materialsRepository.findOne({
        where: { metrialId: id },
      });

      if (!material) {
        throw new NotFoundException(`Material with ID ${id} not found`);
      }

      // Delete the material
      await this.materialsRepository.remove(material);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error removing Material:', error);
      throw new InternalServerErrorException('Error removing Material');
    }
  }
}
