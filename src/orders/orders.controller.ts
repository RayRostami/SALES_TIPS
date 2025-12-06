import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto, OrderFilterDto } from './order.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('orders')
@UseGuards(AuthGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    const role = req.headers['x-user-role'] ? parseInt(req.headers['x-user-role']) : req.user.role;
    return this.ordersService.create(createOrderDto, req.user.sub, role);
  }

  @Get()
  findAll(@Query() filterDto: OrderFilterDto, @Request() req) {
    const role = req.headers['x-user-role'] ? parseInt(req.headers['x-user-role']) : req.user.role;
    return this.ordersService.findAll(filterDto, req.user.sub, role);
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findById(id);
  }

  @Put(':id')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateOrderDto,
    @Request() req,
  ) {
    const role = req.headers['x-user-role'] ? parseInt(req.headers['x-user-role']) : req.user.role;
    return this.ordersService.updateStatus(id, updateDto, req.user.sub, role);
  }

  @Put(':id/cancel')
  cancel(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const role = req.headers['x-user-role'] ? parseInt(req.headers['x-user-role']) : req.user.role;
    return this.ordersService.cancel(id, req.user.sub, role);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req): Promise<void> {
    const role = req.headers['x-user-role'] ? parseInt(req.headers['x-user-role']) : req.user.role;
    await this.ordersService.remove(id, role);
  }
}
