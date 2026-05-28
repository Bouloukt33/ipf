import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePackDto {
  @ApiProperty({ description: 'ID de la catégorie (type de bail)' })
  categoryId: string;

  @ApiProperty({ description: 'Nom du pack' })
  name: string;

  @ApiProperty({ description: 'Slug PackID — URL-friendly (ex: decouverte-bail-commercial)' })
  slug: string;

  @ApiPropertyOptional({ description: 'Description du pack' })
  description?: string;

  @ApiPropertyOptional({
    enum: ['STANDARD', 'VISITEUR', 'PREMIUM'],
    default: 'STANDARD',
    description: 'VISITEUR = onboarding gratuit, STANDARD = pack normal, PREMIUM = pack payant',
  })
  type?: 'STANDARD' | 'VISITEUR' | 'PREMIUM';

  @ApiPropertyOptional({ description: 'Pack accessible gratuitement', default: false })
  isFree?: boolean;

  @ApiPropertyOptional({ description: 'Prix du pack (null si gratuit)' })
  price?: number;

  @ApiPropertyOptional({ description: "Ordre d'affichage", default: 0 })
  order?: number;
}

export class UpdatePackDto {
  @ApiPropertyOptional() name?: string;
  @ApiPropertyOptional() slug?: string;
  @ApiPropertyOptional() description?: string;
  @ApiPropertyOptional({ enum: ['STANDARD', 'VISITEUR', 'PREMIUM'] }) type?: string;
  @ApiPropertyOptional() isFree?: boolean;
  @ApiPropertyOptional() price?: number;
  @ApiPropertyOptional() order?: number;
  @ApiPropertyOptional() isActive?: boolean;
  @ApiPropertyOptional() categoryId?: string;
}

export class AddQuestionsDto {
  @ApiProperty({ description: 'IDs des questions à associer au pack', type: [String] })
  questionIds: string[];
}
