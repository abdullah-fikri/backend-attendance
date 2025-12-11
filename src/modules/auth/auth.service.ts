import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { verifyPassword } from 'src/common/utils/password.util';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, plainPassword: string) {
    const user = await this.getUserByEmail(email);

    if (!user) {
      throw new HttpException(
        {
          message: 'user with this email address not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const isValidPassword = await verifyPassword(
      user.passwordHash,
      plainPassword,
    );

    if (!isValidPassword) {
      throw new HttpException(
        {
          message: 'incorrect password entered',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const payload = { sub: user.id, role: user.role.name };

    const token = this.jwtService.sign(payload);

    return token;
  }

  async getUserByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
      },
    });
  }
}
