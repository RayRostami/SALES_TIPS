import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { OrderLine } from './order-line.entity';
import { CreateOrderDto, UpdateOrderDto, OrderFilterDto } from './order.dto';
import { OrderStatus } from './order-status.enum';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderLine)
    private orderLinesRepository: Repository<OrderLine>,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: number, userRole: number): Promise<Order> {
    // If not admin, set agentId to current user
    const agentId = userRole === 3 ? createOrderDto.agentId : userId;

    // Calculate total
    let total = 0;
    createOrderDto.orderLines.forEach(line => {
      const lineTotal = (line.unitPrice || 0) * line.orderQty;
      total += lineTotal;
    });

    // Create order (excluding orderLines to prevent cascade save)
    const { orderLines: _, ...orderData } = createOrderDto;
    const order = this.ordersRepository.create({
      ...orderData,
      agentId,
      orderDate: new Date(),
      total: parseFloat(total.toFixed(2)),
      orderStatus: OrderStatus.NEW,
    });

    const savedOrder = await this.ordersRepository.save(order);

    // Create order lines
    const orderLines = createOrderDto.orderLines.map(line => {
      const ext = (line.unitPrice || 0) * line.orderQty;
      return this.orderLinesRepository.create({
        ...line,
        orderId: savedOrder.orderId,
        ext: parseFloat(ext.toFixed(2)),
      });
    });

    await this.orderLinesRepository.save(orderLines);

    // Return order with lines
    return this.findById(savedOrder.orderId);
  }

  async findAll(filterDto: OrderFilterDto, userId: number, userRole: number): Promise<Order[]> {
    const query = this.ordersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.orderLines', 'orderLines')
      .leftJoinAndSelect('orderLines.material', 'material')
      .leftJoinAndSelect('order.agent', 'agent');

    let hasWhere = false;

    // If not admin, only show user's orders
    if (userRole !== 3) {
      query.where('order.agentId = :userId', { userId });
      hasWhere = true;
    }

    // Apply filters - Admin only filters
    if (filterDto.agentId && userRole === 3) {
      if (hasWhere) {
        query.andWhere('order.agentId = :agentId', { agentId: filterDto.agentId });
      } else {
        query.where('order.agentId = :agentId', { agentId: filterDto.agentId });
        hasWhere = true;
      }
    }

    if (filterDto.orderId && userRole === 3) {
      if (hasWhere) {
        query.andWhere('order.orderId = :orderId', { orderId: filterDto.orderId });
      } else {
        query.where('order.orderId = :orderId', { orderId: filterDto.orderId });
        hasWhere = true;
      }
    }

    if (filterDto.startDate && filterDto.endDate && userRole === 3) {
      if (hasWhere) {
        query.andWhere('order.orderDate BETWEEN :startDate AND :endDate', {
          startDate: filterDto.startDate,
          endDate: filterDto.endDate,
        });
      } else {
        query.where('order.orderDate BETWEEN :startDate AND :endDate', {
          startDate: filterDto.startDate,
          endDate: filterDto.endDate,
        });
        hasWhere = true;
      }
    }

    // Status filter - available for all users
    if (filterDto.orderStatus) {
      if (hasWhere) {
        query.andWhere('order.orderStatus = :status', { status: filterDto.orderStatus });
      } else {
        query.where('order.orderStatus = :status', { status: filterDto.orderStatus });
        hasWhere = true;
      }
    }

    query.orderBy('order.orderDate', 'DESC');

    return query.getMany();
  }

  async findById(id: number): Promise<Order> {
    const order = await this.ordersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.orderLines', 'orderLines')
      .leftJoinAndSelect('orderLines.material', 'material')
      .leftJoinAndSelect('order.agent', 'agent')
      .where('order.orderId = :id', { id })
      .getOne();

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async updateStatus(
    id: number,
    updateDto: UpdateOrderDto,
    userId: number,
    userRole: number,
  ): Promise<Order> {
    const order = await this.findById(id);

    // Check permissions
    if (userRole !== 3) {
      // Non-admin can only update their own orders
      if (order.agentId !== userId) {
        throw new ForbiddenException('You can only update your own orders');
      }
      // Non-admin can only cancel orders
      if (updateDto.orderStatus && updateDto.orderStatus !== OrderStatus.CANCELLED) {
        throw new ForbiddenException('You can only cancel orders');
      }
    }

    // Update order
    Object.assign(order, updateDto);
    return this.ordersRepository.save(order);
  }

  async cancel(id: number, userId: number, userRole: number): Promise<Order> {
    const order = await this.findById(id);

    // Check if order belongs to user (if not admin)
    if (userRole !== 3 && order.agentId !== userId) {
      throw new ForbiddenException('You can only cancel your own orders');
    }

    // Check if order can be cancelled
    if (order.orderStatus === OrderStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed orders');
    }

    order.orderStatus = OrderStatus.CANCELLED;
    return this.ordersRepository.save(order);
  }

  async remove(id: number, userRole: number): Promise<void> {
    // Only admin can delete
    if (userRole !== 3) {
      throw new ForbiddenException('Only administrators can delete orders');
    }

    const order = await this.findById(id);
    await this.ordersRepository.remove(order);
  }
}
