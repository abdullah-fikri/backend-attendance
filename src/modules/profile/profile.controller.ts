import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('')
  @ResponseMessage('Success get data profile user')
  getProfile(@Req() req) {
    if (!req.user?.userId) {
      throw new HttpException(
        { message: "Can't find user id from token" },
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.usersService.findOne(req.user.userId);
  }
}
