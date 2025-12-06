import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';
import { Material } from '../materials/material.entity';

@Entity('order_lines')
export class OrderLine {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_id', nullable: true })
  orderId: number;

  @ManyToOne(() => Order, order => order.orderLines)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'material_id', nullable: true })
  materialId: number;

  @ManyToOne(() => Material, { nullable: true })
  @JoinColumn({ name: 'material_id' })
  material: Material;

  @Column({ name: 'order_qty', type: 'integer', nullable: true })
  orderQty: number;

  @Column({ 
    name: 'with_photo', 
    type: 'bit', 
    nullable: true,
    transformer: {
      to: (value: boolean) => value ? '1' : '0',
      from: (value: string) => value === '1'
    }
  })
  withPhoto: boolean;

  @Column({ name: 'unit_price', type: 'numeric', precision: 5, scale: 2, nullable: true })
  unitPrice: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  comment: string;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  ext: number;

  @Column({ type: 'text', nullable: true })
  content: string;
}
