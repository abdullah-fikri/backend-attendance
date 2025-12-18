import { Injectable } from '@nestjs/common';
import { buildMeta, buildPagination } from 'src/common/utils/pagination.util';
import { PrismaService } from 'src/config/prisma.service';

@Injectable()
export class ReportsService {  constructor(private prisma: PrismaService) {}

  async getLeaderboardOnTime(
    params: {
    name?: string;
    month?: number;
    year?: number;
    page?: number;
    limit?: number;
  }) {
    const { name, month, year, page = 1, limit = 10 } = params
    const pagination = buildPagination({ page, limit });

    // --- MONTH FILTER ---
  const parsedMonth = month ? Number(month) : undefined;
  const parsedYear = year ? Number(year) : undefined;

  let dateFilter: any;

  if (parsedMonth && parsedMonth >= 1 && parsedMonth <= 12) {
    const currentYear = parsedYear ?? new Date().getFullYear();

    dateFilter = {
      gte: new Date(Date.UTC(currentYear, parsedMonth - 1, 1)),
      lt: new Date(Date.UTC(currentYear, parsedMonth, 1)),
    };
  }


    // --- SEARCH BY FULLNAME ---
    const users = await this.prisma.user.findMany({
      where: {
        ...(name && {
          fullName: {
            contains: name,
            mode: 'insensitive',
          },
        }),
      },
      select: {
        id: true,
        fullName: true,
      },
    });

    if (users.length === 0) {
      return {
        data: [],
        meta: buildMeta(pagination.page, pagination.limit, 0),
      };
    }

    const userIds = users.map(u => u.id);
    const userMap = new Map(users.map(u => [u.id, u]));

    // --- GROUP ATTENDANCE ---
    const grouped = await this.prisma.attendance.groupBy({
    by: ['userId'],
    where: {
        userId: { in: userIds },
        status: 'ON_TIME',
        ...(dateFilter && { createdAt: dateFilter }),
    },
    _count: {
        id: true,
    },
    orderBy: {
        _count: {
        id: 'desc',
        },
    },
    });

  const leaderboard = grouped.map((item, index) => {
    const user = userMap.get(item.userId);

    return {
      rank: index + 1,
      userId: item.userId,
      fullname: user?.fullName ?? '-',
      onTimeCount: item._count.id,
    };
  });


  const total = leaderboard.length;
  const paginatedData = leaderboard.slice(
    pagination.skip,
    pagination.skip + pagination.take,
  );

  return {
    data: paginatedData,
    meta: buildMeta(pagination.page, pagination.limit, total),
  };
  }
}
