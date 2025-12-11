import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ResponseMessage('success to login')
  async login(@Body() body: { email: string; password: string }) {
    const { email, password } = body;

    return await this.authService.login(email, password);
  }
}
