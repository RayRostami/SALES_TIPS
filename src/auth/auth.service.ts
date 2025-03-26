// src/auth/auth.service.ts
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { Agent } from '../agents/agent.entity';
import { MailService } from 'src/mail/mail.service';
import * as crypto from 'crypto';


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Agent)
    private agentsRepository: Repository<Agent>,
    private jwtService: JwtService,    
    private mailService: MailService,
  ) {}
  
  async validateUser(email: string, pass: string): Promise<any> {
    try {  

      const user = await this.agentsRepository.findOne({
        where: { email },
        select: ['id', 'email', 'password', 'firstName', 'lastName', 'isActive', 'role'] // Include all needed fields
      });      

      if (!user) {
        throw new UnauthorizedException('Email or password is incorrect.');
      }
     
      
      if (pass !== user.password) {
        throw new UnauthorizedException('Email or password is incorrect');
      }
      if (!user.isActive) {
        throw new UnauthorizedException('Your account is not activated yet.');
      }

      const { password, ...result } = user;
      return result;
    }
    catch (error) {
      console.error('Login error:', error);
      throw new UnauthorizedException(error.message || 'Invalid credentials');
    }
  }

  async login(user: any) {
    try {
      const payload = { email: user.email, sub: user.id };
      return { 
        access_token: this.jwtService.sign(payload, { expiresIn: '2h'}), 
        user: {
          firstName: user?.firstName, 
          lastName: user?.lastName, 
          id: user?.id, 
          role: user?.role
        } 
      };
    } catch (error) {
      console.error('Login error:', error);
      throw new UnauthorizedException('Login failed');
    }
  }

  async sendPasswordResetEmail(email: string) {
    const user = await this.agentsRepository.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if email exists or not
      return { message: 'If the email exists, reset instructions will be sent' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1);

    user.activationToken = resetToken;
    user.activationExpires = resetTokenExpiry;
    await this.agentsRepository.save(user);

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    await this.mailService.sendMail({
      to: email,
      subject: 'Password Reset Request',
      template: 'password-reset',
      context: {
        firstName: user.firstName,
        lastName: user.lastName,
        resetLink,
        expiresIn: '2 hour',
        currentYear: new Date().getFullYear(),
      },
    });

    return { message: 'Password reset instructions sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.agentsRepository.findOne({
      where: {
        activationToken: token,
        activationExpires: MoreThan(new Date()),
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    user.password = newPassword;
    user.activationToken = null;
    user.activationExpires = null;
    await this.agentsRepository.save(user);

    return { message: 'Password reset successful.' };
  }
}
