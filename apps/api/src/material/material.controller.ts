import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { MaterialService } from './material.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBody, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MaterialType } from '@prisma/client';

@ApiTags('Materials')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('materials')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Post()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        type: { type: 'string', enum: ['TEXT', 'VIDEO', 'DOCUMENT'] },
        content: { type: 'string' },
        url: { type: 'string' },
        moduleId: { type: 'string' },
      },
    },
  })
  async create(
    @Body()
    data: {
      title: string;
      type: MaterialType;
      content?: string;
      url?: string;
      moduleId: string;
    },
    @Request() req: { user: { id: string; role: string } },
  ) {
    const userId = req.user.id;
    const userRole = req.user.role;
    return this.materialService.create(userId, userRole, data);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.materialService.findOne(id);
  }

  @Put(':id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        type: { type: 'string', enum: ['TEXT', 'VIDEO', 'DOCUMENT'] },
        content: { type: 'string' },
        url: { type: 'string' },
      },
    },
  })
  update(
    @Param('id') id: string,
    @Request() req: { user: { id: string; role: string } },
    @Body()
    data: {
      title?: string;
      type?: MaterialType;
      content?: string;
      url?: string;
    },
  ) {
    return this.materialService.update(id, req.user.id, req.user.role, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: { user: { id: string; role: string } }) {
    return this.materialService.remove(id, req.user.id, req.user.role);
  }
}
