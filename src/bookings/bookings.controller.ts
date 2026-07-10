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
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // ─── POST /api/bookings ────────────────────────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new booking (public)' })
  @ApiCreatedResponse({ description: 'Booking created successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid input or booking date in the past' })
  @ApiNotFoundResponse({ description: 'Service not found' })
  create(@Body() dto: CreateBookingDto) {
    return this.bookingsService.create(dto);
  }

  // ─── GET /api/bookings ─────────────────────────────────────────────────────

  @Get()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all bookings (authenticated)' })
  @ApiOkResponse({ description: 'Returns an array of all bookings.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  findAll() {
    return this.bookingsService.findAll();
  }

  // ─── GET /api/bookings/:id ─────────────────────────────────────────────────

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

  // ─── PATCH /api/bookings/:id/status ────────────────────────────────────────

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

  // ─── DELETE /api/bookings/:id ──────────────────────────────────────────────

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
