import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ProgressionService } from './progression.service';

@ApiTags('Progression')
@Controller('progression')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ProgressionController {
  constructor(private progressionService: ProgressionService) {}

  @Get()
  @ApiOperation({
    summary: "Toutes les progressions de l'utilisateur, groupées par mois",
  })
  getAll(@CurrentUser() user: any) {
    return this.progressionService.getAll(user.userId);
  }

  @Get('themes')
  @ApiOperation({ summary: "Progression par thème de l'utilisateur" })
  getThemes(@CurrentUser() user: any) {
    return this.progressionService.getThemes(user.userId);
  }

  @Get(':month')
  @ApiOperation({ summary: 'Progression pour un mois donné (format YYYY-MM)' })
  @ApiParam({ name: 'month', example: '2024-03' })
  getByMonth(@Param('month') month: string, @CurrentUser() user: any) {
    return this.progressionService.getByMonth(month, user.userId);
  }
}
