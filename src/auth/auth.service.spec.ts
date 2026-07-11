import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { ConflictException } from '@nestjs/common';

jest.mock('bcrypt', () => ({
    compare: jest.fn(),
    hash: jest.fn(),
}));

describe('AuthService', () => {
    let service: AuthService;

    const mockUsersService = {
        findByEmail: jest.fn(),
        findById: jest.fn(),
        create: jest.fn(),
        updateRefreshToken: jest.fn(),
    };
    const mockJwtService = {
        sign: jest.fn().mockReturnValue('access-token'),
        signAsync: jest.fn().mockResolvedValue('refresh-token'),
        verify: jest.fn().mockReturnValue({
            sub: 'user-id',
            email: 'harry@example.com',
        }),
    };
    const mockConfigService = {
        getOrThrow: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
        mockUsersService.findByEmail.mockResolvedValue(null);

        await expect(
            service.login({
                email: 'harry@example.com',
                password: 'harry@123',
            }),
        ).rejects.toThrow();
    });

    it('should register a new user successfully', async () => {
        mockUsersService.findByEmail.mockResolvedValue(null);

        mockUsersService.create.mockResolvedValue({
            id: 'user-id',
            email: 'harry@example.com',
            name: 'Harry Thomson',
        });

        mockJwtService.signAsync.mockResolvedValue('access-token');

        mockConfigService.getOrThrow.mockReturnValue('1d');

        const result = await service.register({
            email: 'harry@example.com',
            password: 'harry@123',
            name: 'Harry Thomson',
        });

        expect(mockUsersService.create).toHaveBeenCalled();
        expect(result).toBeDefined();
    });
    it('should login successfully with valid credentials', async () => {
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);

        mockUsersService.findByEmail.mockResolvedValue({
            id: 'user-id',
            email: 'harry@example.com',
            password: '$2b$12$hashedpassword',
            name: 'Harry Thomson',
        });

        mockJwtService.sign.mockReturnValue('access-token');

        mockConfigService.getOrThrow.mockReturnValue('1d');

        const result = await service.login({
            email: 'harry@example.com',
            password: 'harry@123',
        });

        expect(result).toBeDefined();
        expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
            'harry@example.com',
        );
    });

    it('should refresh tokens successfully', async () => {
        const user = {
            id: 'user-id',
            email: 'harry@example.com',
            name: 'Harry Thomson',
            refreshToken: '$2b$12$validhashedrefreshtoken',
        };

        mockUsersService.findById.mockResolvedValue(user);

        mockJwtService.sign.mockReturnValue('new-access-token');

        mockJwtService.signAsync.mockResolvedValue('new-refresh-token');

        mockConfigService.getOrThrow.mockReturnValue('7d');

        const result = await service.refresh({
            refreshToken: 'valid-refresh-token',
        });

        expect(result).toBeDefined();

        expect(mockUsersService.updateRefreshToken)
            .toHaveBeenCalled();

    });
    it('should throw UnauthorizedException when password is incorrect', async () => {
        mockUsersService.findByEmail.mockResolvedValue({
            id: 'user-id',
            email: 'harry@example.com',
            password: '$2b$12$hashedpassword',
            name: 'Harry Thomson',
        });

        (bcrypt.compare as jest.Mock).mockResolvedValue(false);

        await expect(
            service.login({
                email: 'harry@example.com',
                password: 'WrongPassword@123',
            }),
        ).rejects.toThrow();
    });

    it('should throw error when registering with an existing email', async () => {
        mockUsersService.create.mockRejectedValue(
            new ConflictException('Email already registered'),
        );

        await expect(
            service.register({
                email: 'harry@example.com',
                password: 'Password@123',
                name: 'Harry Thomson',
            }),
        ).rejects.toThrow(ConflictException);

        expect(mockUsersService.create).toHaveBeenCalled();
    });
});