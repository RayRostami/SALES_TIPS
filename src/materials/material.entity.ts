import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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

  @Column({ name: 'unit_price', type: 'numeric', precision: 5, scale: 2, nullable: true })
  unitPrice: number;

  @Column({ name: 'unit_qty', type: 'integer', nullable: true })
  unitQty: number;
}
