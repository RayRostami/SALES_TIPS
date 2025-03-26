import { Controller, Get, Post, Body, Param, ParseIntPipe, Delete, HttpStatus, HttpCode, Put } from '@nestjs/common';
import { PayStatusService } from './payStatus.service';

@Controller('paystatus')
export class PayStatusController {
  constructor(private payStatusService: PayStatusService) {}

  
  @Get()
  findAll() {
    return this.payStatusService.findAll();
  }  
}