import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: "Email de l'utilisateur (identifiant de connexion Auth0)",
    example: 'agent@lecarrepro.fr',
  })
  @IsEmail({}, { message: 'Adresse email invalide' })
  email: string;

  @ApiPropertyOptional({
    description: "Nom affiché dans l'application",
    example: 'Marie Dupont',
  })
  @IsOptional()
  @IsString()
  @Length(1, 80)
  displayName?: string;

  @ApiPropertyOptional({
    enum: ['USER', 'MODERATOR', 'ADMIN'],
    default: 'USER',
    description: 'Rôle attribué au compte',
  })
  @IsOptional()
  @IsEnum(['USER', 'MODERATOR', 'ADMIN'])
  role?: 'USER' | 'MODERATOR' | 'ADMIN';
}
