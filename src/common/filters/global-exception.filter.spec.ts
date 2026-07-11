import { ArgumentsHost } from '@nestjs/common';
import { GlobalExceptionFilter } from './global-exception.filter';
import { Prisma } from '@prisma/client';

describe('GlobalExceptionFilter', () => {
    let filter: GlobalExceptionFilter;

    beforeEach(() => {
        filter = new GlobalExceptionFilter();
    });

    it('should return 409 for Prisma duplicate error (P2002)', () => {
        const mockRequest = {
            url: '/test',
            method: 'POST',
        };

        const mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        const mockHost = {
            switchToHttp: () => ({
                getRequest: () => mockRequest,
                getResponse: () => mockResponse,
            }),
        } as unknown as ArgumentsHost;


        const prismaError = new Prisma.PrismaClientKnownRequestError(
            'Unique constraint failed',
            {
                code: 'P2002',
                clientVersion: '6.19.3',
                meta: {
                    target: ['email'],
                },
            },
        );


        filter.catch(prismaError, mockHost);

        expect(mockResponse.status).toHaveBeenCalledWith(409);
        expect(mockResponse.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                statusCode: 409,
            }),
        );
    });

    it('should return 500 for unknown errors', () => {
        const mockRequest = {
            url: '/test',
            method: 'GET',
        };

        const mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        const mockHost = {
            switchToHttp: () => ({
                getRequest: () => mockRequest,
                getResponse: () => mockResponse,
            }),
        } as unknown as ArgumentsHost;

        filter.catch(new Error('Something went wrong'), mockHost);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalled();
    });
});