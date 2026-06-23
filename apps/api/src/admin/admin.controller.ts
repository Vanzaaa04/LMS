import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  async getUsers(@Query('role') role?: Role) {
    return this.adminService.getUsers(role);
  }

  @Put('users/:id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
        role: { type: 'string', enum: ['STUDENT', 'LECTURER', 'ADMIN'] },
        password: { type: 'string' },
      },
    },
  })
  async updateUser(
    @Param('id') id: string,
    @Body() data: { name?: string; email?: string; role?: Role; password?: string },
  ) {
    return this.adminService.updateUser(id, data);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string, @Request() req: { user: { id: string; role: string } }) {
    if (req.user.id === id) {
      throw new ForbiddenException('Admin cannot delete their own account');
    }
    return this.adminService.deleteUser(id);
  }

  @Get('statistics')
  async getStatistics() {
    return this.adminService.getStatistics();
  }
}
