import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';

@Module({
  controllers: [ServicesController],
  providers: [ServicesService],
  // PrismaService is available globally via PrismaModule (@Global decorator)
  // AuthModule is imported at AppModule level and exports PassportModule/JwtStrategy
  // so JwtAuthGuard works here without a local import of AuthModule
})
export class ServicesModule {}
