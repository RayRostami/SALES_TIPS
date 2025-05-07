import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Agent } from '../agents/agent.entity';
import { Product } from '../products/product.entity';
import { Company } from '../companies/company.entity';
import { PayStatus } from 'src/payStatus/payStatus.entity';
import { DatePickerConfig } from 'antd/es/config-provider/context';


@Entity()
export class Sale {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  salesDate: Date;

  @Column({name:'salesAmount', type:'numeric', 'precision':10, scale:2})
  salesAmount: number;

  @Column({name:'coverage', type:'numeric', 'precision':10, scale:2})
  coverage?: number;

  @Column({name:'commission', type:'numeric', 'precision':15, scale:2})
  commission?: number;
 
  @Column({name:'fyc', type:'numeric', 'precision':15, scale:2})
  fyc?: number;

  @Column({name:'policy_num'})
  policyNum: string;

  @Column({name:'client_name'})
  clientName: string;

  @Column({name:'note'})
  note?: string;

  @Column({name:'payment_date'})
  paymentDate?: Date;

  
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