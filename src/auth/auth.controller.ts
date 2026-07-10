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
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ─── POST /api/auth/register ─────────────────────────────────────────────────

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

  // ─── POST /api/auth/login ────────────────────────────────────────────────────

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in and receive a JWT access token' })
  @ApiOkResponse({
    description: 'Login successful. Returns a JWT access token.',
    schema: {
      example: {
        access_token: 'eyJhbGci...',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // ─── GET /api/auth/me ────────────────────────────────────────────────────────

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
