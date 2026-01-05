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

@Entity('ticket_attachment')
export class TicketAttachment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'ticket_id' })
  ticketId: number;

  @Column({ name: 'file_name', length: 255 })
  fileName: string;

  @Column({ name: 'file_path', length: 500 })
  filePath: string;

  @Column({ name: 'file_type', length: 100, nullable: true })
  fileType: string;

  @Column({ name: 'file_size', nullable: true })
  fileSize: number;

  @Column({ name: 'uploaded_by' })
  uploadedBy: number;

  @CreateDateColumn({ name: 'uploaded_at' })
  uploadedAt: Date;

  // Relations
  @ManyToOne(() => Ticket, (ticket) => ticket.attachments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ticket_id' })
  ticket: Ticket;

  @ManyToOne(() => Agent)
  @JoinColumn({ name: 'uploaded_by' })
  uploader: Agent;
}
