import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Agent } from '../agents/agent.entity';
import { Company } from '../companies/company.entity';
import { TicketType } from './ticket-type.entity';
import { TicketStatus } from './ticket-status.entity';
import { TicketAttachment } from './ticket-attachment.entity';
import { TicketComment } from './ticket-comment.entity';

@Entity('ticket')
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column('text')
  description: string;

  @Column({ name: 'ticket_type_id' })
  ticketTypeId: number;

  @Column({ name: 'status_id', default: 1 })
  statusId: number;

  @Column({ default: 'medium' })
  priority: string;

  @Column({ name: 'created_by' })
  createdBy: number;

  @Column({ name: 'assigned_to', nullable: true })
  assignedTo: number;

  @Column({ name: 'company_id', nullable: true })
  companyId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'resolved_at', nullable: true })
  resolvedAt: Date;

  @Column({ name: 'last_viewed_at', nullable: true, type: 'timestamp' })
  lastViewedAt: Date;

  // Relations
  @ManyToOne(() => TicketType)
  @JoinColumn({ name: 'ticket_type_id' })
  ticketType: TicketType;

  @ManyToOne(() => TicketStatus)
  @JoinColumn({ name: 'status_id' })
  status: TicketStatus;

  @ManyToOne(() => Agent)
  @JoinColumn({ name: 'created_by' })
  creator: Agent;

  @ManyToOne(() => Agent)
  @JoinColumn({ name: 'assigned_to' })
  assignee: Agent;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @OneToMany(() => TicketAttachment, (attachment) => attachment.ticket)
  attachments: TicketAttachment[];

  @OneToMany(() => TicketComment, (comment) => comment.ticket)
  comments: TicketComment[];
}
