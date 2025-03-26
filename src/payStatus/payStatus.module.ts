import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayStatus  } from './payStatus.entity';
import { PayStatusService } from './payStatus.service';
import { PayStatusController } from './payStatus.controller';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [AuthModule,
    JwtModule.registerAsync({
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: { expiresIn: '120m' },
        }),
      }),TypeOrmModule.forFeature([PayStatus])],
  providers: [PayStatusService],
  controllers: [PayStatusController],
})
export class PayStatusModule {}