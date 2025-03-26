import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from './sales.entity';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';

import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [    
  AuthModule,
  JwtModule.registerAsync({
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
      secret: configService.get<string>('JWT_SECRET'),
      signOptions: { expiresIn: '120m' },
    }),
  }),
    TypeOrmModule.forFeature([Sale])],
  providers: [SalesService],
  controllers: [SalesController],
})
export class SalesModule {}