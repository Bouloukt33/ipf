---
name: api-conventions
description: Conventions NestJS/Prisma de l'API IPF — DTO class-validator obligatoires, guards Auth0 (AuthGuard + PermissionsGuard), patterns Prisma 7, pagination, erreurs. À lire avant de créer ou modifier un endpoint dans apps/api.
---

# Conventions API (NestJS 11 + Prisma 7)

## Endpoint type

```ts
@ApiTags('Packs')
@Controller('packs')
export class PacksController {
  constructor(private readonly packsService: PacksService) {}

  @Post()
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('manage:packs')
  @ApiOperation({ summary: 'Créer un pack' })
  create(@Body() dto: CreatePackDto, @CurrentUser() user: ICurrentUser) {
    return this.packsService.create(dto, user.userId);
  }
}
```

- Préfixe global `api` déjà appliqué (`main.ts`) → route réelle `/api/packs`.
- Swagger auto-généré : `@ApiTags` + `@ApiOperation` sur chaque route (visible sur `/api/docs` hors prod).

## Validation — DTO obligatoires

`ValidationPipe` global tourne avec `whitelist + forbidNonWhitelisted + transform` :
**tout champ non déclaré dans le DTO est rejeté avec une 400**. Donc :

- Chaque body/query a son DTO dans `dto/` avec décorateurs `class-validator`
  (`@IsString()`, `@IsOptional()`, `@IsInt()` + `@Type(() => Number)` pour les query params).
- Jamais de `@Body() body: any`.

## Auth (Auth0)

- `AuthGuard` (JWT JWKS RS256) + `PermissionsGuard` + `@Permissions('perm')`.
- L'utilisateur vient de `@CurrentUser()` : `{ userId (= auth0Id !), email, permissions, roles }`.
- **Attention** : `userId` du token = `auth0Id` — résoudre l'id interne via
  `prisma.user.findUnique({ where: { auth0Id } })` (pattern présent partout dans les services).

## Prisma 7

- Client généré dans le `node_modules` RACINE ; imports : `from '@prisma/client'`.
- Datasource URL dans `prisma.config.ts` (pas dans le schema).
- Schéma : `@map` snake_case systématique — suivre le style existant.
- Migration : `npx prisma migrate dev --name <nom>` depuis `apps/api` ; jamais
  de `db push` (les migrations tournent au boot Docker, fail-fast).
- Multi-écritures cohérentes → `prisma.$transaction`.
- Toujours `select`/`include` minimal (voir green-it-performance).

## Erreurs

Exceptions Nest sémantiques avec message **français** utilisateur :
`NotFoundException('Utilisateur non trouvé')`, `ForbiddenException`,
`BadRequestException`. Jamais de `throw new Error()` dans un controller/service.

## Pagination (listes admin)

Pattern existant (cf. `users.service.ts`) : query `page`/`limit` (défaut 1/20),
réponse `{ data, meta: { total, page, limit, totalPages } }`.

## Redis / cache

`cache-manager` + Redis branchés. Lectures chaudes et coûteuses (leaderboards,
stats dashboard) → cache avec TTL court (60–300 s) et invalidation à l'écriture.

## Checklist avant de terminer

1. DTO + validation sur toute entrée
2. Guards + `@Permissions` sur toute route non publique
3. `<domaine>.service.spec.ts` mis à jour (voir writing-tests)
4. `npm run typecheck && npm run lint && npm test` verts depuis la racine
5. Pas de nouveau `any`, pas de `console.log` (utiliser `Logger` de Nest)
