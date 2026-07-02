import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const domain = configService.get<string>('AUTH0_DOMAIN');
    const audience = configService.get<string>('AUTH0_AUDIENCE');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${domain}/.well-known/jwks.json`,
      }),

      audience: audience,

      issuer: `https://${domain}/`,

      algorithms: ['RS256'],
    });
  }

  /**
   * Cette méthode est appelée après validation du token
   * Le payload contient les claims du token JWT
   */
  validate(payload: any): any {
    if (!payload) {
      throw new UnauthorizedException('Token invalide');
    }

    return {
      userId: payload.sub,
      email: payload.email || payload['https://ipf.com/email'],
      permissions: (payload.permissions || []).map((p: string) => p.trim()),
      roles: payload['https://ipf.com/roles'] || [],
    };
  }
}
