import { Test, TestingModule } from '@nestjs/testing';
import { ServicesService } from './services.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ServicesService', () => {
    let service: ServicesService;

    const mockPrismaService = {
        service: {
            create: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ServicesService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<ServicesService>(ServicesService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should create a service successfully', async () => {
        const dto = {
            title: 'Hair Cut',
            description: 'Professional haircut service',
            duration: 60,
            price: 25.00,
            isActive: true,
        };

        mockPrismaService.service.create.mockResolvedValue({
            id: 'service-id',
            ...dto,
        });

        const result = await service.create(dto);

        expect(mockPrismaService.service.create).toHaveBeenCalled();
        expect(result).toEqual({
            id: 'service-id',
            ...dto,
        });
    });

    it('should update a service successfully', async () => {
        const updatedService = {
            id: 'service-id',
            title: 'Updated Hair Cut',
            description: 'Updated description',
            duration: 90,
            price: 30,
            isActive: true,
        };

        mockPrismaService.service.findUnique.mockResolvedValue({
            id: 'service-id',
        });

        mockPrismaService.service.update.mockResolvedValue(updatedService);

        const result = await service.update('service-id', {
            title: 'Updated Hair Cut',
            duration: 90,
        });

        expect(mockPrismaService.service.findUnique)
            .toHaveBeenCalledWith({
                where: {
                    id: 'service-id',
                },
            });

        expect(mockPrismaService.service.update)
            .toHaveBeenCalled();

        expect(result).toEqual(updatedService);
    });

    it('should delete a service successfully', async () => {
        mockPrismaService.service.findUnique.mockResolvedValue({
            id: 'service-id',
        });

        mockPrismaService.service.delete.mockResolvedValue({
            id: 'service-id',
        });

        const result = await service.remove('service-id');

        expect(mockPrismaService.service.findUnique)
            .toHaveBeenCalledWith({
                where: {
                    id: 'service-id',
                },
            });

        expect(mockPrismaService.service.delete)
            .toHaveBeenCalledWith({
                where: {
                    id: 'service-id',
                },
            });

        expect(result).toBeDefined();
    });

    it('should throw error when updating a non-existing service', async () => {
        mockPrismaService.service.findUnique.mockResolvedValue(null);

        await expect(
            service.update('invalid-service-id', {
                title: 'Updated Service',
            }),
        ).rejects.toThrow();

        expect(mockPrismaService.service.findUnique)
            .toHaveBeenCalledWith({
                where: {
                    id: 'invalid-service-id',
                },
            });
    });

    it('should throw error when deleting a non-existing service', async () => {
        mockPrismaService.service.findUnique.mockResolvedValue(null);

        await expect(
            service.remove('invalid-service-id'),
        ).rejects.toThrow();

        expect(mockPrismaService.service.findUnique)
            .toHaveBeenCalledWith({
                where: {
                    id: 'invalid-service-id',
                },
            });
    });
});