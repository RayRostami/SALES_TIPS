import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agent } from '../agents/agent.entity';
import { MailModule } from '../mail/mail.module';
import { AuthGuard } from './auth.guard';
import { ConfigService } from '@nestjs/config';


@Module({
  imports: [
   JwtModule.registerAsync({
       inject: [ConfigService],
       useFactory: (configService: ConfigService) => ({
         secret: configService.get<string>('JWT_SECRET'),
         signOptions: { expiresIn: '120m' },
       }),
     }),
    TypeOrmModule.forFeature([Agent]),MailModule,
    JwtModule.register({ secret: 'secretKey', signOptions: { expiresIn: '1d' } }),
  ],
  controllers: [AuthController],
  providers: [AuthGuard,AuthService],
  exports: [AuthGuard,AuthService,AuthModule],
})
export class AuthModule {}