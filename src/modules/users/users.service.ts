import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { buildMeta, buildPagination } from 'src/common/utils/pagination.util';
import { UserMapper } from './mappers/user-mapper';
import { hateoas } from 'src/common/utils/hateoas.util';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll(query: GetUsersDto, baseUrl: string) {
    const {page, limit, skip, take} = buildPagination(query)
    
    const where: any = {}

    if (query.search){
      where.OR =[
        {email: {contains: query.search, mode: 'insensitive'}},
        {fullName: {contains: query.search, mode: 'insensitive'}},
      ];
    }

    if (query.role){
      where.role = {name: query.role}
    }

    const [data, total] =  await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        include: {role: true},
        orderBy: {createdAt: 'desc'}
      }),
      this.prisma.user.count({where})
    ]);

    const meta = buildMeta(page, limit, total);
    const links = hateoas(baseUrl, meta.page, meta.limit, meta.totalPages);
  
    return {
      meta,
      links,
      data: data.map((user) => UserMapper.toResponse(user)),
    }
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
      throw new NotFoundException('User not found');
    }

    return UserMapper.toResponse(user);
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
