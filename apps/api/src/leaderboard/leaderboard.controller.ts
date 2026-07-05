import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { LeaderboardService } from './leaderboard.service';

@ApiTags('Leaderboard')
@Controller('leaderboard')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class LeaderboardController {
  constructor(private leaderboardService: LeaderboardService) {}

  @Get()
  @ApiOperation({
    summary: 'Classement global — podium (top 3) + liste (rang 4+)',
  })
  getGlobal(@CurrentUser() user: any) {
    return this.leaderboardService.getGlobal(user.userId);
  }

  @Get('podium')
  @ApiOperation({ summary: 'Podium uniquement (top 3)' })
  getPodium() {
    return this.leaderboardService.getPodium();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Classement par catégorie ou thème (slug)' })
  @ApiParam({ name: 'slug', example: 'bail-commercial' })
  getBySlug(@Param('slug') slug: string, @CurrentUser() user: any) {
    return this.leaderboardService.getBySlug(slug, user.userId);
  }
}
