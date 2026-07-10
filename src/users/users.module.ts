import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService],
  exports: [UsersService], // exported so AuthModule can inject it
})
export class UsersModule {}
