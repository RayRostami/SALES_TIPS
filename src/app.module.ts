import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { AgentsModule } from './agents/agents.module';
import { SalesModule } from './sales/sales.module';
import { ProductsModule } from './products/product.module';
import { CompaniesModule } from './companies/companies.module';
import { Agent } from './agents/agent.entity';
import { Sale } from './sales/sales.entity';
import { Product } from './products/product.entity';
import { Company } from './companies/company.entity';
import { PayStatus } from './payStatus/payStatus.entity';
import { PayStatusModule } from './payStatus/payStatus.module';
import { MailModule } from './mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './auth/auth.guard';
import { ContractModule } from './contract/contract.module';
import { Contract } from './contract/contract.entity';
import { ContractStatus } from './contract/contractStatus.entity';
import { ExcelModule } from './excel/excel.module';
import { MaterialsModule } from './materials/material.module';
import { Material } from './materials/material.entity';
import { MaterialCategory } from './materials/material-category.entity';
import { Unit } from './materials/unit.entity';
import { MaterialUnit } from './materials/material-unit.entity';
import { OrdersModule } from './orders/orders.module';
import { Order } from './orders/order.entity';
import { OrderLine } from './orders/order-line.entity';
import { TicketsModule } from './tickets/tickets.module';
import { Ticket } from './tickets/ticket.entity';
import { TicketType } from './tickets/ticket-type.entity';
import { TicketStatus } from './tickets/ticket-status.entity';
import { TicketAttachment } from './tickets/ticket-attachment.entity';
import { TicketComment } from './tickets/ticket-comment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes config available throughout the app
      envFilePath: '.env', // Specify your .env file path
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '120m' },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      //password: 'Tips2025@!',
      password: 'Pass12345!',
      database: 'sales_db',
      entities: [
        Agent,
        Sale,
        Product,
        Company,
        PayStatus,
        Contract,
        ContractStatus,
        Material,
        MaterialCategory,
        Unit,
        MaterialUnit,
        Order,
        OrderLine,
        Ticket,
        TicketType,
        TicketStatus,
        TicketAttachment,
        TicketComment,
      ],
      synchronize: false,
      ssl: false,
    }),

    AuthModule,
    AgentsModule,
    SalesModule,
    ProductsModule,
    CompaniesModule,
    PayStatusModule,
    MailModule,
    ContractModule,
    ExcelModule,
    MaterialsModule,
    OrdersModule,
    TicketsModule,
  ],
  providers: [AuthGuard],
  exports: [AuthGuard, JwtModule],
})
export class AppModule {}
