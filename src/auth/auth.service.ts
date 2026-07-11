import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { StringValue } from 'ms';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

/** Number of bcrypt salt rounds — 12 is a good balance of security and performance */
const SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // ─── Registration ─────────────────────────────────────────────────────────────

  async register(dto: RegisterDto) {
    // Hash the password before touching the database
    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);

    // UsersService.create throws ConflictException on duplicate email
    const user = await this.usersService.create({
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
    });

    // Return safe user object + access token (so the client is immediately authenticated)
    const { password: _password, refreshToken: _rt, ...safeUser } = user;
    return {
      user: safeUser,
      access_token: this.signAccessToken(user.id, user.email),
    };
  }

  // ─── Login ────────────────────────────────────────────────────────────────────

  async login(dto: LoginDto) {
    // 1. Look up the user
    const user = await this.usersService.findByEmail(dto.email);

    // Deliberate generic message — don't reveal whether the email exists
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 2. Constant-time password comparison via bcrypt
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 3. Issue both tokens and store the hashed refresh token
    const tokens = await this.generateAndStoreTokens(user.id, user.email);
    return tokens;
  }

  // ─── Refresh ──────────────────────────────────────────────────────────────────

  async refresh(dto: RefreshTokenDto) {
    // 1. Verify JWT signature and expiry on the refresh token
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(dto.refreshToken, {
        secret: this.configService.getOrThrow<string>('REFRESH_TOKEN_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    // 2. Load the user and check the stored hash
    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    const isTokenValid = await bcrypt.compare(dto.refreshToken, user.refreshToken);
    if (!isTokenValid) {
      throw new UnauthorizedException('Refresh token does not match');
    }

    // 3. Rotate: generate new pair and overwrite stored hash
    return this.generateAndStoreTokens(user.id, user.email);
  }

  // ─── Logout ───────────────────────────────────────────────────────────────────

  async logout(userId: string) {
    await this.usersService.clearRefreshToken(userId);
    return { message: 'Logged out successfully' };
  }

  // ─── Private helpers ──────────────────────────────────────────────────────────

  private signAccessToken(userId: string, email: string): string {
    const payload: JwtPayload = { sub: userId, email };
    return this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      expiresIn: this.configService.getOrThrow<string>('ACCESS_TOKEN_EXPIRATION') as StringValue,
    });
  }

  private signRefreshToken(userId: string, email: string): string {
    const payload: JwtPayload = { sub: userId, email };
    return this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.getOrThrow<string>('REFRESH_TOKEN_EXPIRATION') as StringValue,
    });
  }

  private async generateAndStoreTokens(userId: string, email: string) {
    const accessToken = this.signAccessToken(userId, email);
    const refreshToken = this.signRefreshToken(userId, email);

    // Hash the refresh token before persisting — never store plain tokens
    const hashedRefreshToken = await bcrypt.hash(refreshToken, SALT_ROUNDS);
    await this.usersService.updateRefreshToken(userId, hashedRefreshToken);

    return { accessToken, refreshToken };
  }
}
