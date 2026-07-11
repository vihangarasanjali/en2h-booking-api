import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ─── POST /api/auth/register ──────────────────────────────────────────────────

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiCreatedResponse({
    description: 'User created successfully. Returns the new user and an access token.',
    schema: {
      example: {
        user: {
          id: 'uuid-here',
          email: 'john.doe@example.com',
          name: 'John Doe',
          createdAt: '2026-07-10T09:00:00.000Z',
          updatedAt: '2026-07-10T09:00:00.000Z',
        },
        access_token: 'eyJhbGci...',
      },
    },
  })
  @ApiConflictResponse({ description: 'A user with this email already exists' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // ─── POST /api/auth/login ─────────────────────────────────────────────────────

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in and receive JWT access + refresh tokens' })
  @ApiOkResponse({
    description: 'Login successful. Returns an access token and a refresh token.',
    schema: {
      example: {
        accessToken: 'eyJhbGci...',
        refreshToken: 'eyJhbGci...',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // ─── POST /api/auth/refresh ───────────────────────────────────────────────────

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate tokens using a valid refresh token' })
  @ApiOkResponse({
    description: 'Returns a new access token and a rotated refresh token.',
    schema: {
      example: {
        accessToken: 'eyJhbGci...',
        refreshToken: 'eyJhbGci...',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Refresh token is invalid, expired, or revoked' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }

  // ─── POST /api/auth/logout ────────────────────────────────────────────────────

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Log out and revoke the stored refresh token' })
  @ApiOkResponse({
    description: 'Logged out successfully. The refresh token is invalidated.',
    schema: { example: { message: 'Logged out successfully' } },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  logout(@Request() req: any) {
    return this.authService.logout(req.user.id);
  }

  // ─── GET /api/auth/me ─────────────────────────────────────────────────────────

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the currently authenticated user profile' })
  @ApiOkResponse({
    description: 'Returns the profile of the authenticated user (no password).',
    schema: {
      example: {
        id: 'uuid-here',
        email: 'john.doe@example.com',
        name: 'John Doe',
        createdAt: '2026-07-10T09:00:00.000Z',
        updatedAt: '2026-07-10T09:00:00.000Z',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  getMe(@Request() req: any) {
    // req.user is populated by JwtStrategy.validate() — password already excluded
    return req.user;
  }
}
