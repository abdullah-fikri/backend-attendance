import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import type { Response } from 'express';
import { Public } from 'src/common/decorators/public.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: CreateAuthDto })
  @ResponseMessage('success to login')
  async login(
    @Body() body: CreateAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { email, password } = body;
    const token = await this.authService.login(email, password);
    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24,
    });
  }

  @Post('logout')
  @Public()
  @ResponseMessage('success to logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });
  }
}
