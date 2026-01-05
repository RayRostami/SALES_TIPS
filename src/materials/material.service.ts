import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from './material.entity';
import { MaterialCategory } from './material-category.entity';
import { Unit } from './unit.entity';
import { MaterialUnit } from './material-unit.entity';

@Injectable()
export class MaterialsService {
  constructor(
    @InjectRepository(Material)
    private materialsRepository: Repository<Material>,
    @InjectRepository(MaterialCategory)
    private categoryRepository: Repository<MaterialCategory>,
    @InjectRepository(Unit)
    private unitRepository: Repository<Unit>,
    @InjectRepository(MaterialUnit)
    private materialUnitRepository: Repository<MaterialUnit>,
  ) {}

  create(material: Partial<Material>) {
    return this.materialsRepository.save(material);
  }

  findAll(categoryId?: number) {
    const where = categoryId ? { categoryId } : {};
    return this.materialsRepository.find({ where, relations: ['category'] });
  }

  findAllCategories() {
    return this.categoryRepository.find();
  }

  findAllUnits() {
    return this.unitRepository.find();
  }

  async addMaterialUnit(materialId: number, unitId: number, price: number) {
    const material = await this.findById(materialId);
    const unit = await this.unitRepository.findOne({ where: { unitId } });
    
    if (!unit) {
      throw new NotFoundException(`Unit with ID ${unitId} not found`);
    }

    const materialUnit = this.materialUnitRepository.create({
      materialId,
      unitId,
      price,
    });

    return this.materialUnitRepository.save(materialUnit);
  }

  async updateMaterialUnit(materialId: number, unitId: number, price: number) {
    const materialUnit = await this.materialUnitRepository.findOne({
      where: { materialId, unitId },
    });

    if (!materialUnit) {
      throw new NotFoundException(`Material unit not found`);
    }

    materialUnit.price = price;
    return this.materialUnitRepository.save(materialUnit);
  }

  async removeMaterialUnit(materialId: number, unitId: number) {
    const materialUnit = await this.materialUnitRepository.findOne({
      where: { materialId, unitId },
    });

    if (!materialUnit) {
      throw new NotFoundException(`Material unit not found`);
    }

    await this.materialUnitRepository.remove(materialUnit);
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
