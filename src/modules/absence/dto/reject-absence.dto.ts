import { IsOptional, IsString } from 'class-validator';

export class RejectAbsenceDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

export class ApproveAbsenceDto {
  @IsOptional()
  @IsString()
  reason?: string;
}