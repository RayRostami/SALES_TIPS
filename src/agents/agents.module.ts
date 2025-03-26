import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agent } from './agent.entity';
import { AgentsService } from './agents.service';
import { AgentsController } from './agents.controller';
import { MailModule } from 'src/mail/mail.module';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
@Module({
  imports: [AuthModule,
    JwtModule.registerAsync({
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: { expiresIn: '60m' },
        }),
      }),TypeOrmModule.forFeature([Agent]),MailModule],
  providers: [AgentsService],
  controllers: [AgentsController],
})
export class AgentsModule {}