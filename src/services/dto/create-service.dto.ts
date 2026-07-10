import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateServiceDto {
  @ApiProperty({
    example: 'Deep Tissue Massage',
    description: 'Title of the service (max 150 characters)',
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty({ message: 'Title must not be empty' })
  @MaxLength(150, { message: 'Title must not exceed 150 characters' })
  title: string;

  @ApiPropertyOptional({
    example: 'A therapeutic massage targeting deeper muscle layers.',
    description: 'Optional description of the service',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description?: string;

  @ApiProperty({
    example: 60,
    description: 'Duration of the service in minutes (minimum 1)',
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt({ message: 'Duration must be an integer' })
  @Min(1, { message: 'Duration must be at least 1 minute' })
  duration: number;

  @ApiProperty({
    example: 75.00,
    description: 'Price of the service (must be a positive number)',
    minimum: 0.01,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Price must be a number with at most 2 decimal places' })
  @IsPositive({ message: 'Price must be a positive number' })
  price: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the service is active and bookable (defaults to true)',
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean value' })
  isActive?: boolean;
}
