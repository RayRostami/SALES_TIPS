import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Ticket } from './ticket.entity';
import { TicketType } from './ticket-type.entity';
import { TicketStatus } from './ticket-status.entity';
import { TicketAttachment } from './ticket-attachment.entity';
import { TicketComment } from './ticket-comment.entity';
import { Agent } from '../agents/agent.entity';
import { MailService } from '../mail/mail.service';
import {
  CreateTicketDto,
  UpdateTicketDto,
  AssignTicketDto,
  AddCommentDto,
  TicketQueryDto,
} from './ticket.dto';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    @InjectRepository(TicketType)
    private ticketTypeRepository: Repository<TicketType>,
    @InjectRepository(TicketStatus)
    private ticketStatusRepository: Repository<TicketStatus>,
    @InjectRepository(TicketAttachment)
    private ticketAttachmentRepository: Repository<TicketAttachment>,
    @InjectRepository(TicketComment)
    private ticketCommentRepository: Repository<TicketComment>,
    @InjectRepository(Agent)
    private agentRepository: Repository<Agent>,
    private mailService: MailService,
  ) {}

  // Create a new ticket (agents with role = 1 or role = 4)
  async create(
    createTicketDto: CreateTicketDto,
    agentId: number,
  ): Promise<Ticket> {
    const agent = await this.agentRepository.findOne({ where: { id: agentId } });
    if (!agent || (agent.role !== 1 && agent.role !== 4)) {
      throw new ForbiddenException('Only agents with role 1 or 4 can create tickets');
    }

    // Validate ticket type exists
    const ticketType = await this.ticketTypeRepository.findOne({
      where: { id: createTicketDto.ticketTypeId },
    });
    if (!ticketType) {
      throw new BadRequestException('Invalid ticket type');
    }

    // If assignedTo is provided, validate it's a role 3 or 4 agent
    if (createTicketDto.assignedTo) {
      const assignee = await this.agentRepository.findOne({
        where: { id: createTicketDto.assignedTo },
      });
      if (!assignee || (assignee.role !== 3 && assignee.role !== 4)) {
        throw new BadRequestException(
          'Ticket can only be assigned to agents with role 3 (admin) or 4 (supervisor)',
        );
      }
    }

    const ticket = this.ticketRepository.create({
      ...createTicketDto,
      createdBy: agentId,
      statusId: 1, // Default to "Open" status
    });

    return await this.ticketRepository.save(ticket);
  }

  // Get all tickets with filtering and pagination
  async findAll(query: TicketQueryDto, agentId: number): Promise<any> {
    const agent = await this.agentRepository.findOne({ where: { id: agentId } });
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.ticketType', 'ticketType')
      .leftJoinAndSelect('ticket.status', 'status')
      .leftJoinAndSelect('ticket.creator', 'creator')
      .leftJoinAndSelect('ticket.assignee', 'assignee')
      .leftJoinAndSelect('ticket.company', 'company')
      .leftJoinAndSelect('ticket.attachments', 'attachments')
      .leftJoinAndSelect('ticket.comments', 'comments')
      .orderBy('ticket.createdAt', 'DESC');

    // Role-based filtering
    if (agent.role === 1) {
      // Agents with role 1 see only their created tickets
      queryBuilder.where('ticket.createdBy = :agentId', { agentId });
    } else if (agent.role === 3 || agent.role === 4) {
      // Admins (role 3) and Supervisors (role 4) see all tickets
      // If you want to restrict to only assigned tickets, uncomment the next line
      // queryBuilder.where('ticket.assignedTo = :agentId', { agentId });
    }

    // Search by title or description
    if (query.search) {
      queryBuilder.andWhere(
        '(ticket.title ILIKE :search OR ticket.description ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    // Filter by status
    if (query.statusId) {
      queryBuilder.andWhere('ticket.statusId = :statusId', {
        statusId: query.statusId,
      });
    }

    // Filter by ticket type
    if (query.ticketTypeId) {
      queryBuilder.andWhere('ticket.ticketTypeId = :ticketTypeId', {
        ticketTypeId: query.ticketTypeId,
      });
    }

    // Filter by assigned agent
    if (query.assignedTo) {
      queryBuilder.andWhere('ticket.assignedTo = :assignedTo', {
        assignedTo: query.assignedTo,
      });
    }

    // Filter by priority
    if (query.priority) {
      queryBuilder.andWhere('ticket.priority = :priority', {
        priority: query.priority,
      });
    }

    const [tickets, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    // Add hasNewComments flag for agent's tickets
    const ticketsWithFlags = tickets.map((ticket) => {
      let hasNewComments = false;
      if (agent.role === 1 && ticket.createdBy === agentId) {
        const lastViewedAt = ticket.lastViewedAt || ticket.createdAt;
        hasNewComments = ticket.comments?.some(
          (comment) => comment.createdAt > lastViewedAt && comment.agentId !== agentId
        ) || false;
      }
      return {
        ...ticket,
        hasNewComments,
      };
    });

    return {
      data: ticketsWithFlags,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Get a single ticket by ID
  async findOne(id: number, agentId: number): Promise<Ticket> {
    const agent = await this.agentRepository.findOne({ where: { id: agentId } });
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: [
        'ticketType',
        'status',
        'creator',
        'assignee',
        'company',
        'attachments',
        'attachments.uploader',
        'comments',
        'comments.agent',
      ],
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Check permissions
    if (
      agent.role === 1 &&
      ticket.createdBy !== agentId &&
      ticket.assignedTo !== agentId
    ) {
      throw new ForbiddenException('You do not have access to this ticket');
    }

    return ticket;
  }

  // Update ticket
  async update(
    id: number,
    updateTicketDto: UpdateTicketDto,
    agentId: number,
  ): Promise<Ticket> {
    const agent = await this.agentRepository.findOne({ where: { id: agentId } });
    const ticket = await this.ticketRepository.findOne({ 
      where: { id },
      relations: ['creator', 'assignee', 'ticketType', 'company', 'comments', 'comments.agent'],
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Store original status to detect changes
    const originalStatusId = ticket.statusId;

    // Check permissions: creator or assignee can update
    if (
      ticket.createdBy !== agentId &&
      ticket.assignedTo !== agentId &&
      (!agent || (agent.role !== 3 && agent.role !== 4))
    ) {
      throw new ForbiddenException('You do not have permission to update this ticket');
    }

    // If updating assignedTo, validate it's a role 3 or 4 agent
    if (updateTicketDto.assignedTo) {
      const assignee = await this.agentRepository.findOne({
        where: { id: updateTicketDto.assignedTo },
      });
      if (!assignee || (assignee.role !== 3 && assignee.role !== 4)) {
        throw new BadRequestException(
          'Ticket can only be assigned to agents with role 3 (admin) or 4 (supervisor)',
        );
      }
    }

    // If status is being changed to resolved/closed, set resolvedAt
    if (
      updateTicketDto.statusId &&
      (updateTicketDto.statusId === 4 || updateTicketDto.statusId === 5)
    ) {
      ticket.resolvedAt = new Date();
    }

    Object.assign(ticket, updateTicketDto);
    const updatedTicket = await this.ticketRepository.save(ticket);

    // Send email notification when status changes to "Back To Agent" (statusId = 3)
    if (updateTicketDto.statusId === 3 && originalStatusId !== 3 && agent && (agent.role === 3 || agent.role === 4)) {
      try {
        // Reload the ticket with all relations to ensure we have complete data
        const fullTicket = await this.ticketRepository.findOne({
          where: { id },
          relations: ['creator', 'assignee', 'ticketType', 'company', 'comments', 'comments.agent'],
        });

        if (!fullTicket) {
          throw new Error('Ticket not found after update');
        }

        // Get the ticket creator (agent) details
        const ticketCreator = fullTicket.creator;
        
        if (ticketCreator && ticketCreator.email) {
          // Get the latest comment
          const latestComment = fullTicket.comments && fullTicket.comments.length > 0 
            ? fullTicket.comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
            : null;

          // Debug log
          console.log('Ticket data for email:', {
            id: fullTicket.id,
            title: fullTicket.title,
            description: fullTicket.description,
            priority: fullTicket.priority,
          });

          // Send email to the agent
          await this.mailService.sendMail({
            to: ticketCreator.email,
            subject: `⚠️ Ticket #${fullTicket.id} Requires Your Action - Back To Agent`,
            template: 'ticket-back-to-agent',
            context: {
              agentName: `${ticketCreator.firstName} ${ticketCreator.lastName}`,
              adminName: `${agent.firstName} ${agent.lastName}`,
              ticketId: fullTicket.id,
              ticketTitle: fullTicket.title || 'No Title',
              ticketType: fullTicket.ticketType?.name || 'N/A',
              priority: fullTicket.priority || 'medium',
              priorityUpper: (fullTicket.priority || 'medium').toUpperCase(),
              companyName: fullTicket.company?.company || 'N/A',
              latestComment: latestComment?.comment || null,
              commentAuthor: latestComment ? `${latestComment.agent?.firstName} ${latestComment.agent?.lastName}` : null,
              commentDate: latestComment ? new Date(latestComment.createdAt).toLocaleString() : null,
              ticketLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/tickets/${fullTicket.id}`,
              currentYear: new Date().getFullYear(),
            },
          });
          console.log(`Email sent to ${ticketCreator.email} for ticket #${fullTicket.id} - Back To Agent`);
        }
      } catch (error) {
        console.error('Error sending "Back To Agent" email notification:', error);
        // Don't throw error - we still want the update to succeed even if email fails
      }
    }

    return updatedTicket;
  }

  // Assign ticket to supervisor
  async assign(
    id: number,
    assignTicketDto: AssignTicketDto,
    agentId: number,
  ): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({ where: { id } });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const assignee = await this.agentRepository.findOne({
      where: { id: assignTicketDto.assignedTo },
    });
    if (!assignee || (assignee.role !== 3 && assignee.role !== 4)) {
      throw new BadRequestException(
        'Ticket can only be assigned to agents with role 3 (admin) or 4 (supervisor)',
      );
    }

    ticket.assignedTo = assignTicketDto.assignedTo;
    ticket.statusId = 2; // Set to "In Progress" when assigned

    return await this.ticketRepository.save(ticket);
  }

  // Close ticket
  async close(id: number, agentId: number): Promise<Ticket> {
    const agent = await this.agentRepository.findOne({ where: { id: agentId } });
    const ticket = await this.ticketRepository.findOne({ where: { id } });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Only admin (role 3), supervisor (role 4), or creator can close
    if ((!agent || (agent.role !== 3 && agent.role !== 4)) && ticket.createdBy !== agentId) {
      throw new ForbiddenException('Only admins, supervisors, or ticket creators can close tickets');
    }

    // Set status based on who is closing: 5 for agent, 6 for admin/supervisor
    if (agent && (agent.role === 3 || agent.role === 4)) {
      ticket.statusId = 6; // Closed By Admin
    } else {
      ticket.statusId = 5; // Closed By Agent
    }
    
    ticket.resolvedAt = new Date();

    return await this.ticketRepository.save(ticket);
  }

  // Get unread comment count for agent
  async getUnreadCount(agentId: number): Promise<{ count: number }> {
    const agent = await this.agentRepository.findOne({ where: { id: agentId } });
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    // Get all tickets created by this agent with fresh data from database (no cache)
    const tickets = await this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.comments', 'comment')
      .where('ticket.createdBy = :agentId', { agentId })
      .cache(false)
      .getMany();

    let unreadCount = 0;
    for (const ticket of tickets) {
      // Find comments from other users
      const otherUsersComments = ticket.comments.filter(comment => comment.agentId !== agentId);
      
      if (otherUsersComments.length > 0) {
        // Get the latest comment from other users
        const latestComment = otherUsersComments.reduce((latest, comment) => {
          const latestTime = latest.createdAt instanceof Date ? latest.createdAt.getTime() : new Date(latest.createdAt).getTime();
          const commentTime = comment.createdAt instanceof Date ? comment.createdAt.getTime() : new Date(comment.createdAt).getTime();
          return commentTime > latestTime ? comment : latest;
        });
        
        const latestCommentTime = latestComment.createdAt instanceof Date 
          ? latestComment.createdAt.getTime() 
          : new Date(latestComment.createdAt).getTime();
        
        const lastViewedAt = ticket.lastViewedAt || ticket.createdAt;
        const lastViewedTime = lastViewedAt instanceof Date 
          ? lastViewedAt.getTime() 
          : new Date(lastViewedAt).getTime();
        
        // If latest comment is newer than last view, mark as unread
        if (latestCommentTime > lastViewedTime) {
          unreadCount++;
        }
      }
    }

    return { count: unreadCount };
  }

  // Mark ticket as viewed by agent
  async markAsViewed(id: number, agentId: number): Promise<void> {
    const ticket = await this.ticketRepository.findOne({ where: { id } });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Only allow the creator to mark as viewed
    if (ticket.createdBy !== agentId) {
      return;
    }

    // Use database UTC function to ensure UTC timestamp like created_at
    await this.ticketRepository
      .createQueryBuilder()
      .update(Ticket)
      .set({ lastViewedAt: () => "(NOW() AT TIME ZONE 'UTC')" })
      .where('id = :id', { id })
      .execute();
  }

  // Delete ticket
  async remove(id: number, agentId: number): Promise<void> {
    const agent = await this.agentRepository.findOne({ where: { id: agentId } });
    const ticket = await this.ticketRepository.findOne({ where: { id } });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Only creator, admin, or supervisor can delete
    if (ticket.createdBy !== agentId && (!agent || (agent.role !== 3 && agent.role !== 4))) {
      throw new ForbiddenException('You do not have permission to delete this ticket');
    }

    await this.ticketRepository.remove(ticket);
  }

  // Add comment to ticket
  async addComment(
    ticketId: number,
    addCommentDto: AddCommentDto,
    agentId: number,
  ): Promise<TicketComment> {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId },
    });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const comment = this.ticketCommentRepository.create({
      ticketId,
      agentId,
      comment: addCommentDto.comment,
      isInternal: addCommentDto.isInternal || false,
    });

    return await this.ticketCommentRepository.save(comment);
  }

  // Get comments for a ticket
  async getComments(ticketId: number): Promise<TicketComment[]> {
    return await this.ticketCommentRepository.find({
      where: { ticketId },
      relations: ['agent'],
      order: { createdAt: 'ASC' },
    });
  }

  // Add attachment
  async addAttachment(
    ticketId: number,
    file: Express.Multer.File,
    agentId: number,
  ): Promise<TicketAttachment> {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId },
    });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const attachment = this.ticketAttachmentRepository.create({
      ticketId,
      fileName: file.originalname,
      filePath: file.path,
      fileType: file.mimetype,
      fileSize: file.size,
      uploadedBy: agentId,
    });

    return await this.ticketAttachmentRepository.save(attachment);
  }

  // Delete attachment
  async removeAttachment(id: number, agentId: number): Promise<void> {
    const attachment = await this.ticketAttachmentRepository.findOne({
      where: { id },
      relations: ['ticket'],
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    const agent = await this.agentRepository.findOne({ where: { id: agentId } });

    // Only uploader, ticket creator, or supervisor can delete
    if (
      attachment.uploadedBy !== agentId &&
      attachment.ticket.createdBy !== agentId &&
      (!agent || agent.role !== 4)
    ) {
      throw new ForbiddenException(
        'You do not have permission to delete this attachment',
      );
    }

    await this.ticketAttachmentRepository.remove(attachment);
  }

  // Get all ticket types
  async getTicketTypes(): Promise<TicketType[]> {
    return await this.ticketTypeRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  // Get all ticket types (including inactive) - Admin only
  async getAllTicketTypes(): Promise<TicketType[]> {
    return await this.ticketTypeRepository.find({
      order: { name: 'ASC' },
    });
  }

  // Create ticket type - Admin only
  async createTicketType(name: string, description?: string, isActive: boolean = true): Promise<TicketType> {
    const ticketType = this.ticketTypeRepository.create({
      name,
      description,
      isActive,
    });
    return await this.ticketTypeRepository.save(ticketType);
  }

  // Update ticket type - Admin only
  async updateTicketType(id: number, name?: string, description?: string, isActive?: boolean): Promise<TicketType> {
    const ticketType = await this.ticketTypeRepository.findOne({ where: { id } });
    if (!ticketType) {
      throw new NotFoundException('Ticket type not found');
    }

    if (name !== undefined) ticketType.name = name;
    if (description !== undefined) ticketType.description = description;
    if (isActive !== undefined) ticketType.isActive = isActive;

    return await this.ticketTypeRepository.save(ticketType);
  }

  // Delete ticket type - Admin only
  async deleteTicketType(id: number): Promise<void> {
    const ticketType = await this.ticketTypeRepository.findOne({ where: { id } });
    if (!ticketType) {
      throw new NotFoundException('Ticket type not found');
    }

    // Check if any tickets are using this type
    const ticketsCount = await this.ticketRepository.count({ where: { ticketTypeId: id } });
    if (ticketsCount > 0) {
      throw new BadRequestException('Cannot delete ticket type that is in use');
    }

    await this.ticketTypeRepository.remove(ticketType);
  }

  // Get all ticket statuses
  async getTicketStatuses(): Promise<TicketStatus[]> {
    return await this.ticketStatusRepository.find({
      where: { isActive: true },
      order: { id: 'ASC' },
    });
  }

  // Get supervisors (agents with role 4) for assignment
  async getSupervisors(): Promise<Agent[]> {
    return await this.agentRepository.find({
      where: { role: 4, isActive: true },
      select: ['id', 'firstName', 'lastName', 'email'],
    });
  }
}
