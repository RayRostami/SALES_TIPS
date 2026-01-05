import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ForbiddenException,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response } from 'express';
import * as fs from 'fs';
import { TicketsService } from './tickets.service';
import {
  CreateTicketDto,
  UpdateTicketDto,
  AssignTicketDto,
  AddCommentDto,
  TicketQueryDto,
  CreateTicketTypeDto,
  UpdateTicketTypeDto,
} from './ticket.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Public } from '../auth/public.decorator';

// File upload configuration
const storage = diskStorage({
  destination: './uploads/tickets',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    cb(null, `ticket-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new BadRequestException(
        'Invalid file type. Allowed types: images, PDF, DOC, DOCX, XLS, XLSX, TXT',
      ),
      false,
    );
  }
};

@Controller('tickets')
@UseGuards(AuthGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  create(@Body() createTicketDto: CreateTicketDto, @Request() req) {
    return this.ticketsService.create(createTicketDto, req.user.sub);
  }

  @Public()
  @Get('types')
  getTicketTypes() {
    return this.ticketsService.getTicketTypes();
  }

  @Public()
  @Get('statuses')
  getTicketStatuses() {
    return this.ticketsService.getTicketStatuses();
  }

  @Public()
  @Get('supervisors')
  getSupervisors() {
    return this.ticketsService.getSupervisors();
  }

  // Admin endpoints for ticket type management
  @Get('admin/types')
  getAllTicketTypes(@Request() req) {
    console.log('User from request:', req.user);
    console.log('User role:', req.user?.role);
    // Check if user is admin (role = 3)
    if (!req.user || req.user.role !== 3) {
      throw new ForbiddenException('Only admins can access this resource');
    }
    return this.ticketsService.getAllTicketTypes();
  }

  @Post('admin/types')
  createTicketType(@Body() createTicketTypeDto: CreateTicketTypeDto, @Request() req) {
    // Check if user is admin (role = 3)
    if (!req.user || req.user.role !== 3) {
      throw new ForbiddenException('Only admins can create ticket types');
    }
    return this.ticketsService.createTicketType(
      createTicketTypeDto.name,
      createTicketTypeDto.description,
      createTicketTypeDto.isActive,
    );
  }

  @Patch('admin/types/:id')
  updateTicketType(
    @Param('id') id: string,
    @Body() updateTicketTypeDto: UpdateTicketTypeDto,
    @Request() req,
  ) {
    // Check if user is admin (role = 3)
    if (!req.user || req.user.role !== 3) {
      throw new ForbiddenException('Only admins can update ticket types');
    }
    return this.ticketsService.updateTicketType(
      +id,
      updateTicketTypeDto.name,
      updateTicketTypeDto.description,
      updateTicketTypeDto.isActive,
    );
  }

  @Delete('admin/types/:id')
  deleteTicketType(@Param('id') id: string, @Request() req) {
    // Check if user is admin (role = 3)
    if (!req.user || req.user.role !== 3) {
      throw new ForbiddenException('Only admins can delete ticket types');
    }
    return this.ticketsService.deleteTicketType(+id);
  }

  @Get()
  findAll(@Query() query: TicketQueryDto, @Request() req) {
    return this.ticketsService.findAll(query, req.user.sub);
  }

  @Get('unread-count')
  getUnreadCount(@Request() req) {
    return this.ticketsService.getUnreadCount(req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    // Mark as viewed when agent opens ticket
    this.ticketsService.markAsViewed(+id, req.user.sub);
    return this.ticketsService.findOne(+id, req.user.sub);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
    @Request() req,
  ) {
    return this.ticketsService.update(+id, updateTicketDto, req.user.sub);
  }

  @Post(':id/assign')
  assign(
    @Param('id') id: string,
    @Body() assignTicketDto: AssignTicketDto,
    @Request() req,
  ) {
    return this.ticketsService.assign(+id, assignTicketDto, req.user.sub);
  }

  @Post(':id/close')
  close(@Param('id') id: string, @Request() req) {
    return this.ticketsService.close(+id, req.user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.ticketsService.remove(+id, req.user.sub);
  }

  @Post(':id/comments')
  addComment(
    @Param('id') id: string,
    @Body() addCommentDto: AddCommentDto,
    @Request() req,
  ) {
    return this.ticketsService.addComment(+id, addCommentDto, req.user.sub);
  }

  @Get(':id/comments')
  getComments(@Param('id') id: string) {
    return this.ticketsService.getComments(+id);
  }

  @Post(':id/attachments')
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      fileFilter,
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    }),
  )
  addAttachment(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.ticketsService.addAttachment(+id, file, req.user.sub);
  }

  @Get('attachments/:id/download')
  async downloadAttachment(@Param('id') id: string, @Res() res: Response) {
    const attachment = await this.ticketsService['ticketAttachmentRepository'].findOne({
      where: { id: +id },
    });

    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    const filePath = attachment.filePath;
    if (fs.existsSync(filePath)) {
      res.download(filePath, attachment.fileName);
    } else {
      return res.status(404).json({ message: 'File not found on server' });
    }
  }

  @Delete('attachments/:id')
  removeAttachment(@Param('id') id: string, @Request() req) {
    return this.ticketsService.removeAttachment(+id, req.user.sub);
  }
}
