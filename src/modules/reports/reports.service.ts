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

  async getMonthlyAnalytics(params: {
    month?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const now = new Date();
  
    let start: Date;
    let end: Date;
  
    /** =========================
     *  PRIORITY:
     *  1. startDate + endDate
     *  2. month
     *  3. current month
     *  ========================= */
    if (params.startDate && params.endDate) {
      start = new Date(params.startDate);
      end = new Date(params.endDate);
      end.setHours(23, 59, 59);
    } else if (params.month) {
      const target = new Date(`${params.month}-01`);
      start = new Date(target.getFullYear(), target.getMonth(), 1);
      end = new Date(target.getFullYear(), target.getMonth() + 1, 0, 23, 59, 59);
    } else {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }
  
    //summary
    const summaryRaw = await this.prisma.attendance.groupBy({
      by: ['status'],
      where: {
        date: { gte: start, lte: end },
      },
      _count: { status: true },
    });
  
    const summary = {
      ON_TIME: 0,
      LATE: 0,
      ABSENT: 0,
      TOTAL: 0,
    };
  
    summaryRaw.forEach((row) => {
      summary[row.status] = row._count.status;
      summary.TOTAL += row._count.status;
    });
  
    // trend
    const trendRaw = await this.prisma.attendance.groupBy({
      by: ['date', 'status'],
      where: {
        date: { gte: start, lte: end },
      },
      _count: { status: true },
      orderBy: { date: 'asc' },
    });
  
    const trendMap = new Map<string, any>();
  
    for (const row of trendRaw) {
      const dateKey = row.date.toISOString().split('T')[0];
  
      if (!trendMap.has(dateKey)) {
        trendMap.set(dateKey, {
          date: dateKey,
          ON_TIME: 0,
          LATE: 0,
          ABSENT: 0,
        });
      }
  
      trendMap.get(dateKey)[row.status] = row._count.status;
    }
  
    return {
      range: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
      },
      summary,
      trend: Array.from(trendMap.values()),
    };
  }
  
}
