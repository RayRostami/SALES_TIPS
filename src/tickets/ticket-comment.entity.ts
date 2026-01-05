import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Ticket } from './ticket.entity';
import { Agent } from '../agents/agent.entity';

@Entity('ticket_comment')
export class TicketComment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'ticket_id' })
  ticketId: number;

  @Column({ name: 'agent_id' })
  agentId: number;

  @Column('text')
  comment: string;

  @Column({ name: 'is_internal', default: false })
  isInternal: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Ticket, (ticket) => ticket.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ticket_id' })
  ticket: Ticket;

  @ManyToOne(() => Agent)
  @JoinColumn({ name: 'agent_id' })
  agent: Agent;
}
