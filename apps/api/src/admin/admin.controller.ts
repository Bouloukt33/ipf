import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AuthGuard, PermissionsGuard, Permissions } from '../auth';

class CreatePlanDto {
  name: string;
  slug: string;
  description?: string;
  price: number;
  currency?: string;
  intervalMonths?: number;
  features?: string[];
  isActive?: boolean;
  order?: number;
}

class UpdatePlanDto {
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  currency?: string;
  intervalMonths?: number;
  features?: string[];
  isActive?: boolean;
  order?: number;
}

@ApiTags('Administration')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(AuthGuard, PermissionsGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  @Permissions('read:admin')
  async getDashboardStats() { return this.adminService.getDashboardStats(); }

  @Get('activity')
  @Permissions('read:admin')
  async getRecentActivity() { return this.adminService.getRecentActivity(); }

  @Get('questions/stats')
  @Permissions('read:admin')
  async getQuestionStats() { return this.adminService.getQuestionStats(); }

  @Get('plans')
  @Permissions('read:admin')
  @ApiOperation({ summary: 'Lister les plans tarifaires' })
  async getPlans() { return this.adminService.getPlans(); }

  @Post('plans')
  @Permissions('write:admin')
  @ApiOperation({ summary: 'Creer un plan tarifaire' })
  async createPlan(@Body() data: CreatePlanDto) { return this.adminService.createPlan(data); }

  @Put('plans/:id')
  @Permissions('write:admin')
  @ApiOperation({ summary: 'Modifier un plan tarifaire' })
  @ApiParam({ name: 'id' })
  async updatePlan(@Param('id') id: string, @Body() data: UpdatePlanDto) { return this.adminService.updatePlan(id, data); }

  @Delete('plans/:id')
  @Permissions('write:admin')
  @ApiOperation({ summary: 'Supprimer un plan tarifaire' })
  @ApiParam({ name: 'id' })
  async deletePlan(@Param('id') id: string) { return this.adminService.deletePlan(id); }
}
