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
      password: 'Tips2025@!',
      database: 'sales_db',
      entities: [Agent, Sale, Product, Company,PayStatus],  
      synchronize: false,
      ssl: false
    }),

    AuthModule,
    AgentsModule,
    SalesModule,
    ProductsModule,
    CompaniesModule,
    PayStatusModule,
    MailModule
  ],
  providers:[AuthGuard],
  exports:[AuthGuard,JwtModule]
})
export class AppModule {}