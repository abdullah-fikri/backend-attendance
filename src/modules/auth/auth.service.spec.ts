import { HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { verifyPassword } from 'src/common/utils/password.util';
import { PrismaService } from 'src/config/prisma.service';
import { AuthService } from './auth.service';

jest.mock('src/common/utils/password.util.ts');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const mockUser = {
      id: '5f4e1a4f-3b3c-443a-9d79-f294eb6e8553',
      email: 'test@example.com',
      fullName: 'user1',
      passwordHash: 'Password@123',
      avatarUrl:
        'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/70.jpg',
      createdAt: '2025-12-11 09:01:55.152',
      updatedAt: '2025-12-11 09:01:55.152',
      deletedAt: null,
      roleId: 1,
      role: {
        id: '1',
        name: 'ADMIN',
      },
    };

    const email = 'test@example.com';
    const password = 'password321';

    it('Should return JWT token when credentials are valid', async () => {
      const expectedToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3OGRkNTRjNy05MDU5LTRlZGMtOGNkZS1lMTMzMjY0OTAzNTYiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NjU1MDY4MTMsImV4cCI6MTc2NTU5MzIxM30.m0kmIX4t-kkt10PfGERIz5J03VpdPZ00usPMOAYRunU';

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      (verifyPassword as jest.Mock).mockResolvedValue(true);

      mockJwtService.sign.mockResolvedValue(expectedToken);

      const result = await service.login(email, password);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email },
        include: { role: true },
      });

      expect(verifyPassword).toHaveBeenCalledWith(
        mockUser.passwordHash,
        password,
      );

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        role: mockUser.role.name,
      });

      expect(result).toBe(expectedToken);
    });

    it('Should throw HttpException with NOT_FOUND when user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(email, password)).rejects.toThrow(
        new HttpException(
          {
            message: 'User with this email address not found',
          },
          HttpStatus.NOT_FOUND,
        ),
      );

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email },
        include: { role: true },
      });

      expect(verifyPassword).not.toHaveBeenCalled();

      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('Should throw HttpException with BAD_REQUEST when Password is incorrect', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      (verifyPassword as jest.Mock).mockResolvedValue(false);

      await expect(service.login(email, password)).rejects.toThrow(
        new HttpException(
          {
            message: 'Incorrect password entered',
          },
          HttpStatus.BAD_REQUEST,
        ),
      );

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email },
        include: { role: true },
      });

      expect(verifyPassword).toHaveBeenCalledWith(
        mockUser.passwordHash,
        password,
      );

      expect(jwtService.sign).not.toHaveBeenCalled();
      ``;
    });
  });

  describe('getUserByEmail', () => {
    const email = 'user2@example.com';
    const mockUser = {
      id: '5f4e1a4f-3b3c-443a-9d79-f294eb6e8553',
      email: 'test@example.com',
      fullName: 'user1',
      passwordHash: 'Password@123',
      avatarUrl:
        'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/70.jpg',
      createdAt: '2025-12-11 09:01:55.152',
      updatedAt: '2025-12-11 09:01:55.152',
      deletedAt: null,
      roleId: 1,
      role: {
        id: '1',
        name: 'ADMIN',
      },
    };

    it('Should retrun user when found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getUserByEmail(email);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email },
        include: { role: true },
      });

      expect(result).toEqual(mockUser);
    });

    it('Should return null when user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const resutl = await service.getUserByEmail(email);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email },
        include: { role: true },
      });

      expect(resutl).toBeNull();
    });
  });
});
