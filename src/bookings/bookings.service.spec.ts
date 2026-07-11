import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../prisma/prisma.service';
import { BookingStatus } from '@prisma/client';

describe('BookingsService', () => {
    let service: BookingsService;

    const mockPrismaService = {
        service: {
            findUnique: jest.fn(),
        },
        booking: {
            findFirst: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            create: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BookingsService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<BookingsService>(BookingsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should throw error when service does not exist', async () => {
        mockPrismaService.service.findUnique.mockResolvedValue(null);

        await expect(
            service.create({
                customerName: 'John Doe',
                customerEmail: 'john@example.com',
                customerPhone: '0771234567',
                serviceId: '11111111-1111-1111-1111-111111111111',
                bookingDate: '2026-08-01',
                bookingTime: '10:00',
                notes: 'Test booking',
            }),
        ).rejects.toThrow();
    });

    it('should throw error when booking date is in the past', async () => {
        mockPrismaService.service.findUnique.mockResolvedValue({
            id: '11111111-1111-1111-1111-111111111111',
            title: 'Test Service',
        });

        await expect(
            service.create({
                customerName: 'John Doe',
                customerEmail: 'john@example.com',
                customerPhone: '0771234567',
                serviceId: '11111111-1111-1111-1111-111111111111',
                bookingDate: '2020-01-01',
                bookingTime: '10:00',
                notes: 'Past booking',
            }),
        ).rejects.toThrow();
    });

    it('should prevent duplicate bookings for the same service slot', async () => {
        mockPrismaService.service.findUnique.mockResolvedValue({
            id: '11111111-1111-1111-1111-111111111111',
            title: 'Test Service',
        });

        mockPrismaService.booking.findFirst.mockResolvedValue({
            id: 'existing-booking-id',
            serviceId: '11111111-1111-1111-1111-111111111111',
            bookingDate: new Date('2026-08-01'),
            bookingTime: '10:00',
        });

        await expect(
            service.create({
                customerName: 'John Doe',
                customerEmail: 'john@example.com',
                customerPhone: '0771234567',
                serviceId: '11111111-1111-1111-1111-111111111111',
                bookingDate: '2026-08-01',
                bookingTime: '10:00',
                notes: 'Duplicate test',
            }),
        ).rejects.toThrow();
    });

    it('should prevent cancelled booking from becoming completed', async () => {
        mockPrismaService.booking.findUnique.mockResolvedValue({
            id: 'booking-id',
            status: BookingStatus.CANCELLED,
        });

        await expect(
            service.updateStatus('booking-id', {
                status: BookingStatus.COMPLETED,
            }),
        ).rejects.toThrow();
    });

    it('should throw error when booking does not exist', async () => {
        mockPrismaService.booking.findUnique.mockResolvedValue(null);

        await expect(
            service.findOne('invalid-booking-id'),
        ).rejects.toThrow();

        expect(mockPrismaService.booking.findUnique)
            .toHaveBeenCalled();
    });
});