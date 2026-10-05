import { Controller, Get, Param } from '@nestjs/common';
import { ToolsService } from './tools.service.js';

@Controller('tools')
export class ToolsController {
  constructor(private readonly toolsService: ToolsService) {}

  @Get()
  findAll() {
    return this.toolsService.findAll();
  }

  @Get(':name')
  findOne(@Param('name') name: string) {
    return this.toolsService.findOne(name);
  }
}
