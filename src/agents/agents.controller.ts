import { Controller, Get, Post, Body, Param, Query,  ParseIntPipe, Put, Delete, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { AuthGuard } from 'src/auth/auth.guard';


@Controller('agents')
@UseGuards(AuthGuard)
export class AgentsController {
  constructor(private agentsService: AgentsService) {}

  @Post()
  create(@Body() agent: any) {
   
    return this.agentsService.create(agent);
  }

  @Get()
  findAll() {
    return this.agentsService.findAll();
  }

  

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() agent: any) {
    return this.agentsService.update(id, agent);
  }

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

  @Get(':id')
  findById(@Param('id', new ParseIntPipe()) id: number) {
    return this.agentsService.findById(id);
  }
  @Post('activate')
  activate(@Body('token') token: string,@Body('newPassword') newPassword: string) {
    return this.agentsService.activate(token, newPassword);
  }
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', new ParseIntPipe()) id: number): Promise<void> {   
    await this.agentsService.remove(id);
  }
}
