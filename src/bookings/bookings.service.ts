import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { BookingQueryDto } from './dto/booking-query.dto';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Create ──────────────────────────────────────────────────────────────────

  async create(dto: CreateBookingDto) {
    // 1. Validate service exists
    const service = await this.prisma.service.findUnique({
      where: { id: dto.serviceId },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID "${dto.serviceId}" not found`);
    }

    // 2. Validate booking date is not in the past
    const bookingDate = new Date(`${dto.bookingDate}T00:00:00Z`);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (bookingDate < today) {
      throw new BadRequestException('Booking date cannot be in the past');
    }

    // Parse time string to a Date object (for Prisma TIME field)
    const timeStr = dto.bookingTime.length === 5 ? `${dto.bookingTime}:00` : dto.bookingTime;
    const bookingTime = new Date(`1970-01-01T${timeStr}Z`);

    return this.prisma.booking.create({
      data: {
        customerName: dto.customerName,
        customerEmail: dto.customerEmail,
        customerPhone: dto.customerPhone,
        bookingDate,
        bookingTime,
        serviceId: dto.serviceId,
        notes: dto.notes,
        // Default status PENDING is handled by schema default, but we can be explicit
        status: BookingStatus.PENDING,
      },
    });
  }

  // ─── Read all ────────────────────────────────────────────────────────────────

  async findAll(dto: BookingQueryDto) {
    const { page = 1, limit = 10, search } = dto;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.booking.findMany({
        where,
        orderBy: [
          { bookingDate: 'desc' },
          { bookingTime: 'desc' },
        ],
        include: {
          service: true,
        },
        skip,
        take: limit,
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─── Read one ────────────────────────────────────────────────────────────────

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        service: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID "${id}" not found`);
    }

    return booking;
  }

  // ─── Update Status ───────────────────────────────────────────────────────────

  async updateStatus(id: string, dto: UpdateBookingStatusDto) {
    const booking = await this.findOne(id);

    // Protect historical records: CANCELLED bookings cannot be modified
    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Cannot change the status of a CANCELLED booking');
    }

    return this.prisma.booking.update({
      where: { id },
      data: {
        status: dto.status,
      },
      include: {
        service: true,
      },
    });
  }

  async remove(id: string) {
    // Ensure the record exists before attempting to cancel
    await this.findOne(id);

    await this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED },
    });

    return { message: `Booking "${id}" cancelled successfully` };
  }
}
