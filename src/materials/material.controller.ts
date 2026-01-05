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
  Query,
  Request,
  ForbiddenException,
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
  findAll(@Query('categoryId') categoryId?: string) {
    return this.materialsService.findAll(categoryId ? parseInt(categoryId) : undefined);
  }

  @Get('categories/all')
  findAllCategories() {
    return this.materialsService.findAllCategories();
  }

  @Get('units/all')
  findAllUnits() {
    return this.materialsService.findAllUnits();
  }

  @Post(':id/units')
  addMaterialUnit(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { unitId: number; price: number },
    @Request() req,
  ) {
    const role = req.headers['x-user-role'] ? parseInt(req.headers['x-user-role']) : req.user?.role;
    if (role !== 3) {
      throw new ForbiddenException('Only admins can manage material units');
    }
    return this.materialsService.addMaterialUnit(id, body.unitId, body.price);
  }

  @Put(':id/units/:unitId')
  updateMaterialUnit(
    @Param('id', ParseIntPipe) id: number,
    @Param('unitId', ParseIntPipe) unitId: number,
    @Body() body: { price: number },
    @Request() req,
  ) {
    const role = req.headers['x-user-role'] ? parseInt(req.headers['x-user-role']) : req.user?.role;
    if (role !== 3) {
      throw new ForbiddenException('Only admins can manage material units');
    }
    return this.materialsService.updateMaterialUnit(id, unitId, body.price);
  }

  @Delete(':id/units/:unitId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMaterialUnit(
    @Param('id', ParseIntPipe) id: number,
    @Param('unitId', ParseIntPipe) unitId: number,
    @Request() req,
  ): Promise<void> {
    const role = req.headers['x-user-role'] ? parseInt(req.headers['x-user-role']) : req.user?.role;
    if (role !== 3) {
      throw new ForbiddenException('Only admins can manage material units');
    }
    await this.materialsService.removeMaterialUnit(id, unitId);
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
