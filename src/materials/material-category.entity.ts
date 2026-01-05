import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('material_category')
export class MaterialCategory {
  @PrimaryGeneratedColumn({ name: 'category_id' })
  categoryId: number;

  @Column({ type: 'varchar', length: 50 })
  category: string;
}
