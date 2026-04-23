import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProfileService } from './profile.service';

@ApiTags('Référentiels')
@Controller('reference')
export class ReferenceController {
  constructor(private profileService: ProfileService) {}

  @Get('job-profiles')
  @ApiOperation({ summary: 'Liste des profils métiers', description: 'Retourne tous les secteurs et profils métiers groupés (public, pas d\'auth requise)' })
  @ApiResponse({ status: 200, description: 'Liste retournée avec succès' })
  async getJobProfiles() {
    return this.profileService.getJobProfiles();
  }

  @Get('age-ranges')
  @ApiOperation({ summary: 'Tranches d\'âge', description: 'Retourne les tranches d\'âge disponibles' })
  @ApiResponse({ status: 200, description: 'Liste retournée' })
  getAgeRanges() {
    return [
      { value: 'AGE_18_25', label: '18-25 ans' },
      { value: 'AGE_26_35', label: '26-35 ans' },
      { value: 'AGE_36_45', label: '36-45 ans' },
      { value: 'AGE_46_55', label: '46-55 ans' },
      { value: 'AGE_56_PLUS', label: '56 ans et plus' },
    ];
  }

  @Get('professional-statuses')
  @ApiOperation({ summary: 'Statuts professionnels', description: 'Retourne les statuts professionnels disponibles' })
  @ApiResponse({ status: 200, description: 'Liste retournée' })
  getProfessionalStatuses() {
    return [
      { value: 'SALARIE', label: 'Salarié' },
      { value: 'INDEPENDANT', label: 'Indépendant' },
      { value: 'MANDATAIRE', label: 'Mandataire' },
    ];
  }
}
