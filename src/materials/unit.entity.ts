import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('units')
export class Unit {
  @PrimaryGeneratedColumn({ name: 'unit_id' })
  unitId: number;

  @Column({ name: 'unit_name', type: 'varchar', length: 50 })
  unitName: string;

  @Column({ name: 'unit_qty', type: 'integer' })
  unitQty: number;
}
