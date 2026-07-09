import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({
    summary:
      "Statistiques globales de l'utilisateur (sessions, réussite, XP, streak)",
  })
  getStats(@CurrentUser() user: any) {
    return this.dashboardService.getStats(user.userId);
  }

  @Get('achievements')
  @ApiOperation({ summary: "Achievements avec progression de l'utilisateur" })
  getAchievements(@CurrentUser() user: any) {
    return this.dashboardService.getAchievements(user.userId);
  }

  @Get('streak')
  @ApiOperation({ summary: 'Streak courant et activité des 7 derniers jours' })
  getStreak(@CurrentUser() user: any) {
    return this.dashboardService.getStreak(user.userId);
  }
}
