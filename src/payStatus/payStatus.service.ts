import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayStatus } from './payStatus.entity';

@Injectable()
export class PayStatusService {
  constructor(
    @InjectRepository(PayStatus)
    private payStatusRepo: Repository<PayStatus>,
  ) {}

  findAll() {
    return this.payStatusRepo.find();
  }
}
