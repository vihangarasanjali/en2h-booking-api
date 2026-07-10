import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Create ──────────────────────────────────────────────────────────────────

  async create(dto: CreateServiceDto) {
    return this.prisma.service.create({
      data: {
        title: dto.title,
        description: dto.description,
        duration: dto.duration,
        // Convert number → Prisma Decimal-compatible string to avoid float noise
        price: dto.price.toString(),
        // Default to true if caller omits the field
        isActive: dto.isActive ?? true,
      },
    });
  }

  // ─── Read all active ─────────────────────────────────────────────────────────

  /**
   * Returns only active services.
   * Public endpoint — no auth needed.
   */
  async findAllActive() {
    return this.prisma.service.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Read one ────────────────────────────────────────────────────────────────

  /**
   * Returns a single service by ID regardless of isActive status.
   * Public endpoint — no auth needed.
   * Throws NotFoundException when the ID does not exist.
   */
  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({ where: { id } });

    if (!service) {
      throw new NotFoundException(`Service with ID "${id}" not found`);
    }

    return service;
  }

  // ─── Update ──────────────────────────────────────────────────────────────────

  async update(id: string, dto: UpdateServiceDto) {
    // Ensure the record exists before attempting to update
    await this.findOne(id);

    return this.prisma.service.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.duration !== undefined && { duration: dto.duration }),
        ...(dto.price !== undefined && { price: dto.price.toString() }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  // ─── Delete ──────────────────────────────────────────────────────────────────

  /**
   * Hard-deletes the service.
   * Prisma will enforce onDelete: Restrict on the bookings FK,
   * so this will throw if the service has associated bookings.
   */
  async remove(id: string) {
    // Ensure the record exists before attempting to delete
    await this.findOne(id);

    await this.prisma.service.delete({ where: { id } });

    return { message: `Service "${id}" deleted successfully` };
  }
}
