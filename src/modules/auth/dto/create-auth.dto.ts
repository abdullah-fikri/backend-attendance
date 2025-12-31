import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateAuthDto {
  @ApiProperty({
    example: 'user@mail.com',
    description: 'Email user',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    minLength: 6,
    description: 'Password user',
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
