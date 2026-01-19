import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard, PermissionsGuard, Permissions } from '../auth';

@Controller('admin')
@UseGuards(AuthGuard, PermissionsGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  @Permissions('read:admin')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('activity')
  @Permissions('read:admin')
  async getRecentActivity() {
    return this.adminService.getRecentActivity();
  }

  @Get('questions/stats')
  @Permissions('read:admin')
  async getQuestionStats() {
    return this.adminService.getQuestionStats();
  }
}
