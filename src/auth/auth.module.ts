import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { StringValue } from 'ms';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    // UsersModule provides UsersService for credential lookups
    UsersModule,

    // ConfigModule must be imported so AuthService can inject ConfigService
    ConfigModule,

    // Register Passport with the default strategy name 'jwt'
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // Configure JwtModule asynchronously so it can read env vars via ConfigService
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        // Default secret used by JwtStrategy for access token verification
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.getOrThrow<string>('ACCESS_TOKEN_EXPIRATION') as StringValue,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy, // Passport registers this as the 'jwt' strategy automatically
    JwtAuthGuard,
  ],
  exports: [
    JwtAuthGuard, // Export so other modules can protect their routes
    JwtStrategy,
    PassportModule,
  ],
})
export class AuthModule {}
