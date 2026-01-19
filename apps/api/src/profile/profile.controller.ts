import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { AuthGuard, PermissionsGuard, Permissions, CurrentUser } from '../auth';

@Controller('profile')
@UseGuards(AuthGuard)
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get()
  @UseGuards(PermissionsGuard)
  @Permissions('read:profile')
  async getProfile(@CurrentUser('userId') userId: string) {
    return this.profileService.getProfile(userId);
  }

  @Put()
  @UseGuards(PermissionsGuard)
  @Permissions('write:profile')
  async updateProfile(
    @CurrentUser('userId') userId: string,
    @Body() data: { displayName?: string; avatarUrl?: string },
  ) {
    return this.profileService.updateProfile(userId, data);
  }

  @Get('stats')
  @UseGuards(PermissionsGuard)
  @Permissions('read:profile')
  async getStats(@CurrentUser('userId') userId: string) {
    return this.profileService.getStats(userId);
  }
}
