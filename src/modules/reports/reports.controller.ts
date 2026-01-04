import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';

@Controller('reports')
export class ReportsController {
constructor(
    private readonly reportsService: ReportsService,
  ) {}


    @Get('leaderboard')
    @Roles("ADMIN")
    @ResponseMessage("Get Leaderboard OnTime successfully")
    async leaderboard(
    @Query('name') name?: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
    ) {
    return this.reportsService.getLeaderboardOnTime({
        name,
        month: month ? Number(month) : 0,
        year: year ? Number(year) : 0,
        })
    }

    @Get('monthly')
    @Roles('ADMIN')
    @ResponseMessage('Get report monthly Success')
    async getMonthlyReport(
      @Query('month') month?: string,
      @Query('startDate') startDate?: string,
      @Query('endDate') endDate?: string,
    ) {
      return this.reportsService.getMonthlyAnalytics({
        month,
        startDate,
        endDate,
      });
    }
}
