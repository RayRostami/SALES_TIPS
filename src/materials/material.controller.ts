import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Put,
  UseGuards,
} from '@nestjs/common';
import { MaterialsService } from './material.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('materials')
@UseGuards(AuthGuard)
export class MaterialsController {
  constructor(private materialsService: MaterialsService) {}

  @Post()
  create(@Body() material: any) {
    return this.materialsService.create(material);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() material: any) {
    return this.materialsService.update(id, material);
  }

  @Get()
  findAll() {
    return this.materialsService.findAll();
  }

  @Get(':id')
  findById(@Param('id', new ParseIntPipe()) id: number) {
    return this.materialsService.findById(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', new ParseIntPipe()) id: number): Promise<void> {
    await this.materialsService.remove(id);
  }
}
