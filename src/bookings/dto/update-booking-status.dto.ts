import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { BookingStatus } from '@prisma/client';

export class UpdateBookingStatusDto {
  @ApiProperty({
    example: 'CONFIRMED',
    description: 'New status for the booking',
    enum: BookingStatus,
  })
  @IsEnum(BookingStatus, { message: 'Invalid booking status' })
  @IsNotEmpty({ message: 'Status is required' })
  status: BookingStatus;
}
