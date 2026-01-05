import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Material } from './material.entity';
import { Unit } from './unit.entity';

@Entity('material_units')
export class MaterialUnit {
  @PrimaryColumn({ name: 'material_id' })
  materialId: number;

  @PrimaryColumn({ name: 'unit_id' })
  unitId: number;

  @Column({ type: 'decimal', precision: 4, scale: 2 })
  price: number;

  @ManyToOne(() => Material, material => material.materialUnits)
  @JoinColumn({ name: 'material_id' })
  material: Material;

  @ManyToOne(() => Unit, { eager: true })
  @JoinColumn({ name: 'unit_id' })
  unit: Unit;
}
