import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { hateoas } from 'src/common/utils/hateoas.util';
import { buildMeta, buildPagination } from 'src/common/utils/pagination.util';
import { PrismaService } from 'src/config/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserMapper } from './mappers/user-mapper';
import { GenerateExcel } from 'src/config/excel/main';
import { UserExcel } from 'src/config/excel/user.worksheet';
import { hashPassword } from 'src/common/utils/password.util';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly excelService: GenerateExcel,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const { email, password, fullName } = createUserDto;
  
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
  
    if (existingUser) {
      throw new HttpException(
        { message: 'Email is already' },
        HttpStatus.BAD_REQUEST,
      );
    }
  
    const hashedPassword = await hashPassword(password);
  
    const user = await this.prisma.user.create({
      data: {
        email,
        fullName,
        passwordHash: hashedPassword,
        roleId: 2, 
      },
    });
  
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  async findAll(query: GetUsersDto, baseUrl: string) {
    const { page, limit, skip, take } = buildPagination(query);

    const where: any = {};

    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { fullName: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.role) {
      where.role = { name: query.role };
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        include: { role: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    const meta = buildMeta(page, limit, total);
    const links = hateoas(baseUrl, meta.page, meta.limit, meta.totalPages);

    return {
      meta,
      links,
      data: data.map((user) => UserMapper.toResponse(user)),
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw new HttpException(
        {
          message: 'User not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return UserMapper.toResponse(user);
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async exportUsers() {
    const users = await this.prisma.user.findMany({
      include: {
        role: true,
      },
    });

    const workbook = this.excelService.createWorkBook();

    const worksheet = workbook.addWorksheet('Users');

    UserExcel(worksheet);

    users.forEach((user, i) => {
      worksheet.addRow({
        id: i + 1,
        fullname: user.fullName,
        email: user.email,
        role: user.role.name,
      });
    });

    return workbook;
  }
}
