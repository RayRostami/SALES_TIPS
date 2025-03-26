// src/agents/agent.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import * as bcrypt from 'bcryptjs';

@Entity('agent')
export class Agent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  fanCode: string;

  @Column({ default: false })
  isActive: boolean;
  
  @Column({ select: true })
  password: string;
  
  @Column({name:'activationtoken', type: 'varchar', nullable: true, select: false })
  activationToken: string | null;

  @Column({name:'activationexpires', type: 'timestamp', nullable: true, select: false })
  activationExpires: Date | null;
  
  @Column({name:'passwordresetrequired', default: false })
  passwordResetRequired: boolean;
  
  @Column({default:1})
  role: number;  

  @Column({name:'phone'})
  phone?: string;  

  @Column({name:'address'})
  address?: string;  
}
