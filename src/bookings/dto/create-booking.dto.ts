import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingDto {
  @ApiProperty({
    example: 'Alice Smith',
    description: 'Name of the customer',
  })
  @IsString()
  @IsNotEmpty({ message: 'Customer name is required' })
  customerName: string;

  @ApiProperty({
    example: 'alice@example.com',
    description: 'Email of the customer',
  })
  @IsEmail({}, { message: 'Must be a valid email' })
  @IsNotEmpty({ message: 'Customer email is required' })
  customerEmail: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'Phone number of the customer',
  })
  @IsString()
  @IsNotEmpty({ message: 'Customer phone is required' })
  customerPhone: string;

  @ApiProperty({
    example: '2026-08-15',
    description: 'Date of the booking (YYYY-MM-DD)',
  })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'bookingDate must be in YYYY-MM-DD format' })
  bookingDate: string;

  @ApiProperty({
    example: '14:00:00',
    description: 'Time of the booking (HH:mm:ss or HH:mm)',
  })
  @IsString()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/, { message: 'bookingTime must be in HH:mm:ss or HH:mm format' })
  bookingTime: string;

  @ApiProperty({
    example: 'uuid-of-the-service',
    description: 'ID of the service being booked',
  })
  @IsUUID('4', { message: 'serviceId must be a valid UUID' })
  @IsNotEmpty({ message: 'Service ID is required' })
  serviceId: string;

  @ApiPropertyOptional({
    example: 'Any special requests...',
    description: 'Optional notes for the booking',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
