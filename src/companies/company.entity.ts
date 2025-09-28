import { Optional } from '@nestjs/common';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  company: string;

  @Column({ name: 'wholesaler', type: 'text', nullable: true })
  @Optional()
  wholeSaler?: string;

  @Column({ name: 'softwarelink' })
  @Optional()
  softwareLink?: string;

  @Column({ name: 'softwarename' })
  @Optional()
  softwareName?: string;

  @Column({ name: 'need_first_app' })
  needFirstApplication: boolean;
}
