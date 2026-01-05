import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { MaterialCategory } from './material-category.entity';
import { MaterialUnit } from './material-unit.entity';

@Entity('materials')
export class Material {
  @PrimaryGeneratedColumn({ name: 'metrial_id' })
  metrialId: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  name: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  image: string;

  @Column({ name: 'unit_qty', type: 'integer', nullable: true })
  unitQty: number;

  @Column({ name: 'category_id', type: 'integer', nullable: true })
  categoryId: number;

  @ManyToOne(() => MaterialCategory, { eager: true })
  @JoinColumn({ name: 'category_id' })
  category: MaterialCategory;

  @OneToMany(() => MaterialUnit, materialUnit => materialUnit.material, { eager: true })
  materialUnits: MaterialUnit[];
}
