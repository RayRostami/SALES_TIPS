// src/agents/agents.service.ts
import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, MoreThan, Repository } from 'typeorm';
import { Agent } from './agent.entity';
import { CreateAgentDto, UpdateAgentDto } from './agent.dto';
import { MailService } from 'src/mail/mail.service';
import { randomUUID } from 'crypto';


@Injectable()
export class AgentsService {
  constructor(
    @InjectRepository(Agent)
    private agentRepository: Repository<Agent>,
    private mailService: MailService,
  ) {}
  

  async create(createAgentDto: CreateAgentDto): Promise<Agent> {
    try {
      // First check if email exists
      const existingAgent = await this.agentRepository.findOne({
        where: { email: createAgentDto.email }
      });

      if (existingAgent) {
        throw new ConflictException('Email address is already in use');
      }

      // Generate temporary password
      var tempPassword = createAgentDto.password.trim();
      
      // Generate activation token
      const activationToken = randomUUID().toString();
      const activationExpires = new Date();
      activationExpires.setHours(activationExpires.getHours() + 24); // 24 hours from now
      
      // Hash the temporary password
      // Create new agent instance with the additional fields
      const agent = this.agentRepository.create({
        ...createAgentDto,
        activationToken,
        activationExpires,
        passwordResetRequired: true,
      });
      
      // Save the agent to database
      const savedAgent = await this.agentRepository.save(agent);
      if(!savedAgent.isActive) {
        await this.sendActivationEmail(
          savedAgent.email,
          savedAgent.firstName,
          tempPassword,
          activationToken
        );
      }
      
      // Return the agent without sensitive information
      const { password, activationToken: token, activationExpires: expires, ...result } = savedAgent;
      return result as Agent;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error; // Re-throw email conflict error
      }
      throw new InternalServerErrorException('Error creating agent');
    }
  }
  
  
  // Helper method to generate random password
  private generateRandomPassword(length: number): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  }
  
  // Helper method to send activation email
  private async sendActivationEmail(
    email: string,
    firstName: string,
    tempPassword: string,
    activationToken: string
  ): Promise<void> {
    const activationLink = `${process.env.FRONTEND_URL}/activate/${activationToken}`;
    
    await this.mailService.sendMail({
      to: email,
      subject: 'Activate Your TIPS Sales System Account',
      template: 'agent-activation', // Create this template in your mail service
      context: {
        firstName,
        email,
        tempPassword,
        activationLink,
        expiresIn: '24 hours',
        currenYear: new Date().getFullYear(),
      },
    });
  }
  
  // Add method to activate account
  async activateAccount(token: string, newPassword: string): Promise<Agent> {
    const agent = await this.agentRepository.findOne({
      select: ['id', 'password', 'activationToken', 'activationExpires'], 
      where: {
        activationToken: token,
        activationExpires: MoreThan(new Date())
      },
    });
    
    if (!agent) {
      throw new NotFoundException('Invalid or expired activation token');
    }
    
    
    
    // Update agent
    agent.password = newPassword;
    agent.activationToken = null;
    agent.activationExpires = null;
    agent.passwordResetRequired = false;
    agent.isActive = true;
    
    // Save updated agent
    const updatedAgent = await this.agentRepository.save(agent);
    
    // Return without sensitive info
    const { password, ...result } = updatedAgent;
    return result as Agent;
  }
  
  async remove(id: number): Promise<void> {
    try {
      // First check if agent exists
      const agent = await this.agentRepository.findOne({ 
        where: { id } 
      });

      if (!agent) {
        throw new NotFoundException(`Agent with ID ${id} not found`);
      }

      // Delete the agent
      await this.agentRepository.remove(agent);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error removing agent:', error);
      throw new InternalServerErrorException('Error removing agent');
    }
  }

  async findAll(): Promise<Agent[]> {
    return await this.agentRepository.find();
  }

  async findById(id: number): Promise<Agent> {
    const agent = await this.agentRepository.findOne({ 
      where: { id } 
    });

    if (!agent) {
      throw new NotFoundException(`Agent with ID ${id} not found`);
    }

    return agent;
  }

  async update(id: number, updateAgentDto: UpdateAgentDto): Promise<Agent> {
    const agent = await this.findById(id);
    
    // Update the agent with new values
    Object.assign(agent, updateAgentDto);
    
    return await this.agentRepository.save(agent);
  }
  async agentsList({
    page,
    size,
    sortField,
    sortOrder,
    search,
  }: {
    page: number;
    size: number;
    sortField: string;
    sortOrder: 'ASC' | 'DESC';
    search: string;
  }) {
    const query = this.agentRepository.createQueryBuilder('agent');

    // Add search conditions
    if (search) {
      query.where(
        new Brackets(qb => {
          qb.where('LOWER(agent.firstName) LIKE LOWER(:search)', { search: `%${search}%` })
            .orWhere('LOWER(agent.lastName) LIKE LOWER(:search)', { search: `%${search}%` })
            .orWhere('LOWER(agent.email) LIKE LOWER(:search)', { search: `%${search}%` })
            .orWhere('LOWER(agent.fanCode) LIKE LOWER(:search)', { search: `%${search}%` });
        })
      );
    }

    // Add sorting
    query.orderBy(`agent.${sortField}`, sortOrder);

    // Add pagination
    const skip = (page - 1) * size;
    query.skip(skip).take(size);
  try{
    // Get results and count
    const [items, total] = await query.getManyAndCount();
    return {
      items,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }
  catch(error){
    console.error('Error fetching agents:', error);
    throw new InternalServerErrorException('Error fetching agents');
  }

    
  }

  async activate(token:string, newPassword:string): Promise<Agent> {
    const agent = await this.agentRepository.findOne({ 
      where: { activationToken: token  } 
    });  
    if (!agent) {
      throw new NotFoundException(`Account not found.`);
    }
    
    agent.isActive = true;
    agent.password = newPassword;
    agent.passwordResetRequired = false;
    agent.activationToken = null;
    agent.activationExpires = null;
    try
    {
      return await this.agentRepository.save(agent);
    }
    catch(error)
    {
      console.log('error:',error)
      throw new InternalServerErrorException('Error activating account');
    }
  }
}
