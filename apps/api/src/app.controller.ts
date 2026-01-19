import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard, PermissionsGuard, Permissions, CurrentUser } from './auth';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Route publique - accessible sans authentification
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('protected')
  @UseGuards(AuthGuard)
  getProtected(@CurrentUser() user: any) {
    return {
      message: 'Vous êtes authentifié!',
      user: user,
    };
  }

  @Get('admin')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('read:admin')
  getAdmin(@CurrentUser() user: any) {
    return {
      message: 'Accès admin autorisé',
      user: user,
    };
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  getProfile(@CurrentUser() user: any) {
    return {
      userId: user.userId,
      email: user.email,
      permissions: user.permissions,
      roles: user.roles,
    };
  }
}
