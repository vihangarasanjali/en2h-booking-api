import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find a single user by their email address.
   * Returns the full record including password hash (callers must strip it).
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  /**
   * Find a single user by their UUID.
   * Returns the full record including password hash (callers must strip it).
   */
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  /**
   * Create a new user.
   * Throws ConflictException when the email is already registered.
   * NOTE: `data.password` must already be hashed before calling this method.
   */
  async create(data: Prisma.UserCreateInput): Promise<User> {
    const existing = await this.findByEmail(data.email);
    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }
    return this.prisma.user.create({ data });
  }
}
