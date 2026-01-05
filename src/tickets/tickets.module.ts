import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { Ticket } from './ticket.entity';
import { TicketType } from './ticket-type.entity';
import { TicketStatus } from './ticket-status.entity';
import { TicketAttachment } from './ticket-attachment.entity';
import { TicketComment } from './ticket-comment.entity';
import { Agent } from '../agents/agent.entity';
import { Company } from '../companies/company.entity';
import { AuthModule } from '../auth/auth.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Ticket,
      TicketType,
      TicketStatus,
      TicketAttachment,
      TicketComment,
      Agent,
      Company,
    ]),
    AuthModule,
    MailModule,
  ],
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule {}
