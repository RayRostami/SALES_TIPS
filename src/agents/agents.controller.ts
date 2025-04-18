import { Controller, Get, Post, Body, Param, Query,  ParseIntPipe, Put, Delete, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { AuthGuard } from 'src/auth/auth.guard';


@Controller('agents')

export class AgentsController {
  constructor(private agentsService: AgentsService) {}
  
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() agent: any) {    
    return this.agentsService.create(agent);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.agentsService.findAll();
  }

  
  @UseGuards(AuthGuard)
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() agent: any) {
    return this.agentsService.update(id, agent);
  }
  
  @UseGuards(AuthGuard)
  @Get('list')
  async getAgents(
    @Query('page', new ParseIntPipe()) page = 1,
    @Query('size', new ParseIntPipe()) size = 10,
    @Query('sortField') sortField:string = 'id' ,
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
    @Query('search') search: string = '',
   ) {    
    
   
    return this.agentsService.agentsList({
      page,
      size,
      sortField,
      sortOrder: sortOrder as 'ASC' | 'DESC',
      search
    });
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  findById(@Param('id', new ParseIntPipe()) id: number) {
    return this.agentsService.findById(id);
  }

  @Post('activate')
  activate(@Body('token') token: string,@Body('newPassword') newPassword: string) {
    return this.agentsService.activate(token, newPassword);
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', new ParseIntPipe()) id: number): Promise<void> {   
    await this.agentsService.remove(id);
  }
}
