import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

/** Number of bcrypt salt rounds — 12 is a good balance of security and performance */
const SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // ─── Registration ────────────────────────────────────────────────────────────

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
    const { password: _password, ...safeUser } = user;
    return {
      user: safeUser,
      access_token: this.signToken(user.id, user.email),
    };
  }

  // ─── Login ───────────────────────────────────────────────────────────────────

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

    // 3. Issue token — do NOT include refresh token
    return {
      access_token: this.signToken(user.id, user.email),
    };
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private signToken(userId: string, email: string): string {
    const payload: JwtPayload = { sub: userId, email };
    return this.jwtService.sign(payload);
    // Expiration is configured via JwtModule.registerAsync (from env JWT_EXPIRATION)
  }
}
