import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Agent } from '../agents/agent.entity';
import { Product } from '../products/product.entity';
import { Company } from '../companies/company.entity';
import { PayStatus } from 'src/payStatus/payStatus.entity';


@Entity()
export class Sale {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  salesDate: Date;

  @Column()
  salesAmount: number;

  @Column({name:'coverage'})
  coverage?: number;

  @Column({name:'commission'})
  commission?: number;
 
  @Column({name:'fyc'})
  fyc?: number;

  @Column({name:'policy_num'})
  policyNum: string;

  @Column({name:'client_name'})
  clientName: string;

  @Column({name:'note'})
  note?: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @ManyToOne(() => Agent)
  @JoinColumn({ name: 'agentId' })
  agent: Agent;

  @ManyToOne(() => PayStatus,  { nullable: false })
  @JoinColumn({ name: 'pay_status_id'})
  payStatus: PayStatus;
}