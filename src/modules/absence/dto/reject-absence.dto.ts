import { IsOptional, IsString } from 'class-validator';

export class RejectAbsenceDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
