import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JwtAuthGuard wraps Passport's built-in 'jwt' strategy.
 *
 * Usage — on a controller or route:
 *   @UseGuards(JwtAuthGuard)
 *
 * When applied, NestJS will reject requests that:
 *   - Do not include an Authorization: Bearer <token> header
 *   - Carry an expired or tampered token
 *   - Belong to a user that no longer exists in the database
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
