import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AbsenceStatus } from 'generated/prisma/enums';
import { PrismaService } from 'src/config/prisma.service';
import { AbsenceService } from './absence.service';
import { CreateAbsenceDto } from './dto/create-absence.dto';

describe('AbsenceService', () => {
  let service: AbsenceService;
  let prisma: PrismaService;

  const mockPrismaService = {
    absenceRequest: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AbsenceService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AbsenceService>(AbsenceService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const userId = '5f4e1a4f-3b3c-443a-9d79-f294eb6e8553';
    const mockDto: CreateAbsenceDto = {
      type: 'SICK',
      startDate: '2025-12-11',
      endDate: '2025-12-12',
      reason: 'Flue',
    };

    const mockFile = {
      location: 'https://storage.example.com/file.pdf',
    };

    it('Should create absence request successfully without file', async () => {
      const mockCreatedAbsence = {
        id: 'absence-123',
        userId,
        type: mockDto.type,
        startDate: new Date(mockDto.startDate),
        endDate: new Date(mockDto.endDate),
        reason: mockDto.reason,
        attachmentUrl: null,
        status: AbsenceStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.absenceRequest.findFirst.mockResolvedValue(null);
      mockPrismaService.absenceRequest.create.mockResolvedValue(
        mockCreatedAbsence,
      );

      const result = await service.create(userId, mockDto);

      expect(prisma.absenceRequest.findFirst).toHaveBeenCalledWith({
        where: {
          userId,
          status: { in: ['PENDING', 'APPROVED'] },
          startDate: { lte: new Date(mockDto.endDate) },
          endDate: { gte: new Date(mockDto.startDate) },
        },
      });

      expect(prisma.absenceRequest.create).toHaveBeenCalledWith({
        data: {
          userId,
          type: mockDto.type,
          startDate: new Date(mockDto.startDate),
          endDate: new Date(mockDto.endDate),
          reason: mockDto.reason,
          attachmentUrl: null,
        },
      });

      expect(result).toEqual(mockCreatedAbsence);
    });

    it('Should create absence request successfully with file', async () => {
      const mockCreatedAbsence = {
        id: 'absence-123',
        userId,
        type: mockDto.type,
        startDate: new Date(mockDto.startDate),
        endDate: new Date(mockDto.endDate),
        reason: mockDto.reason,
        attachmentUrl: mockFile.location,
        status: AbsenceStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.absenceRequest.findFirst.mockResolvedValue(null);
      mockPrismaService.absenceRequest.create.mockResolvedValue(
        mockCreatedAbsence,
      );

      const result = await service.create(userId, mockDto, mockFile);

      expect(prisma.absenceRequest.create).toHaveBeenCalledWith({
        data: {
          userId,
          type: mockDto.type,
          startDate: new Date(mockDto.startDate),
          endDate: new Date(mockDto.endDate),
          reason: mockDto.reason,
          attachmentUrl: mockFile.location,
        },
      });

      expect(result).toEqual(mockCreatedAbsence);
    });

    it('Should throw HttpException with BAD_REQUEST when startDate is after endDate', async () => {
      const invalidDto: CreateAbsenceDto = {
        type: 'SICK',
        startDate: '2025-12-25',
        endDate: '2025-12-20',
        reason: 'Test',
      };

      await expect(service.create(userId, invalidDto)).rejects.toThrow(
        new HttpException(
          { message: 'startDate must be before endDate' },
          HttpStatus.BAD_REQUEST,
        ),
      );

      expect(prisma.absenceRequest.findFirst).not.toHaveBeenCalled();
      expect(prisma.absenceRequest.create).not.toHaveBeenCalled();
    });

    it('Should throw HttpException with CONFLICT when overlap exists', async () => {
      const mockOverlap = {
        id: 'overlap-123',
        userId,
        status: AbsenceStatus.PENDING,
        startDate: new Date('2025-12-19'),
        endDate: new Date('2025-12-21'),
      };

      mockPrismaService.absenceRequest.findFirst.mockResolvedValue(mockOverlap);

      await expect(service.create(userId, mockDto)).rejects.toThrow(
        new HttpException(
          {
            message: 'absence request already exists in selected date range',
          },
          HttpStatus.CONFLICT,
        ),
      );

      expect(prisma.absenceRequest.findFirst).toHaveBeenCalledWith({
        where: {
          userId,
          status: { in: ['PENDING', 'APPROVED'] },
          startDate: { lte: new Date(mockDto.endDate) },
          endDate: { gte: new Date(mockDto.startDate) },
        },
      });

      expect(prisma.absenceRequest.create).not.toHaveBeenCalled();
    });
  });
});
