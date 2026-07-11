import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    example: 'eyJhbGci...',
    description: 'A valid refresh token issued at login',
  })
  @IsString()
  @IsNotEmpty({ message: 'Refresh token must not be empty' })
  refreshToken: string;
}
