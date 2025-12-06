import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Agent } from '../agents/agent.entity';
import { OrderLine } from './order-line.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn({ name: 'order_id' })
  orderId: number;

  @Column({ name: 'order_date', type: 'date', nullable: true })
  orderDate: Date;

  @Column({ name: 'agent_id', nullable: true })
  agentId: number;

  @ManyToOne(() => Agent, { nullable: true })
  @JoinColumn({ name: 'agent_id' })
  agent: Agent;

  @Column({ type: 'varchar', length: 300, nullable: true })
  address: string;

  @Column({ name: 'full_name', type: 'varchar', length: 200, nullable: true })
  fullName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  title: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 50, nullable: true })
  phoneNumber: string;

  @Column({ name: 'instagram_id', type: 'varchar', length: 100, nullable: true })
  instagramId: string;

  @Column({ name: 'linkedin_id', type: 'varchar', length: 100, nullable: true })
  linkedinId: string;

  @Column({ type: 'text', nullable: true })
  photo: string;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  total: number;

  @Column({ name: 'order_status', type: 'varchar', length: 50, nullable: true, default: 'New' })
  orderStatus: string;

  @OneToMany(() => OrderLine, orderLine => orderLine.order, { cascade: true })
  orderLines: OrderLine[];
}
