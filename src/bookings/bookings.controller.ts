import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { BookingStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

import { BookingQueryDto } from './dto/booking-query.dto';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // POST /api/bookings 

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new booking (public)' })
  @ApiCreatedResponse({ description: 'Booking created successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid input or booking date in the past' })
  @ApiNotFoundResponse({ description: 'Service not found' })
  create(@Body() dto: CreateBookingDto) {
    return this.bookingsService.create(dto);
  }

  // GET /api/bookings

  @Get()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all bookings (authenticated)' })
  @ApiOkResponse({ description: 'Returns an array of all bookings.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (starts from 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page (maximum 100)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by customer name, email, or phone' })
  @ApiQuery({ name: 'status', required: false, enum: BookingStatus, description: 'Filter by booking status' })
  findAll(@Query() dto: BookingQueryDto) {
    return this.bookingsService.findAll(dto);
  }

  // GET /api/bookings/:id

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a booking by ID (authenticated)' })
  @ApiOkResponse({ description: 'Returns the booking record.' })
  @ApiNotFoundResponse({ description: 'Booking not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  //PATCH /api/bookings/:id/status 

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a booking status (authenticated)' })
  @ApiOkResponse({ description: 'Booking status updated successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid status transition' })
  @ApiNotFoundResponse({ description: 'Booking not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.updateStatus(id, dto);
  }

  //DELETE /api/bookings/:id

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a booking by ID (authenticated)' })
  @ApiOkResponse({ description: 'Booking deleted successfully.' })
  @ApiNotFoundResponse({ description: 'Booking not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  remove(@Param('id') id: string) {
    return this.bookingsService.remove(id);
  }
}
