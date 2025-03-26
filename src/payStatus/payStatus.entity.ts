import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('pay_status')
export class PayStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({name:'status',nullable:false})
  status: string;
}
