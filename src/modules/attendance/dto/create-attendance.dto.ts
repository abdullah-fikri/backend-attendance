import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class CreateAttendanceDto {
  @ApiProperty({
    example: -6.20000012,
    description: 'Latitude saat clock in',
  })
  @Transform(({ value }) => Number(Number(value).toFixed(8)))
  @IsNumber()
  latIn: number;

  @ApiProperty({
    example: 106.81666654,
    description: 'Longitude saat clock in',
  })
  @Transform(({ value }) => Number(Number(value).toFixed(8)))
  @IsNumber()
  longIn: number;
}

export class CreateClockOutDto {

  @ApiProperty({
    example: -6.20000012,
    description: 'Latitude saat clock out',
  })
  @IsNumber()
  latOut: number;

  @ApiProperty({
    example: 106.81666654,
    description: 'Longitude saat clock out',
  })
  @IsNumber()
  longOut: number;
}
