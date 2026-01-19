import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard, PermissionsGuard, Permissions } from '../auth';
import { UserRole } from '@prisma/client';

@Controller('users')
@UseGuards(AuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Permissions('manage:users')
  async findAll(
    @Query('role') role?: UserRole,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.usersService.findAll({
      role,
      isActive: isActive ? isActive === 'true' : undefined,
      search,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Get('stats')
  @Permissions('read:admin')
  async getStats() {
    return this.usersService.getStats();
  }

  @Get(':id')
  @Permissions('manage:users')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id/role')
  @Permissions('manage:users')
  async updateRole(@Param('id') id: string, @Body('role') role: UserRole) {
    return this.usersService.updateRole(id, role);
  }

  @Post(':id/toggle-active')
  @Permissions('manage:users')
  async toggleActive(@Param('id') id: string) {
    return this.usersService.toggleActive(id);
  }

  @Post(':id/ban')
  @Permissions('manage:users')
  async ban(@Param('id') id: string) {
    return this.usersService.ban(id);
  }
}
