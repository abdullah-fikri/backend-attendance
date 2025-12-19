import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { AbsenceType } from 'generated/prisma/enums';

export class CreateAbsenceDto {
  @IsEnum(AbsenceType)
  type: AbsenceType;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  attachmentUrl?: string;
}
