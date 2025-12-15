import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class CreateAttendanceDto {
  @Transform(({ value }) => Number(Number(value).toFixed(8)))
  @IsNumber()
  latIn: number;

  @Transform(({ value }) => Number(Number(value).toFixed(8)))
  @IsNumber()
  longIn: number;
}

export class CreateClockOutDto{
  latOut: number;
  longOut: number;
}