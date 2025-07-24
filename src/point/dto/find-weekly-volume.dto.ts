import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PointTransactionType } from '../enums/points-transaction-type.enum';
import { PointTransactionStatus } from '../enums/points-transaction-status.enum';
import { VolumeProcessingStatus } from '../enums/volume-processing-status.enum';

export class FindPointsTransactionDto extends PaginationDto {
  @IsOptional()
  @IsEnum(PointTransactionType)
  type?: PointTransactionType;

  @IsOptional()
  @IsEnum(PointTransactionStatus)
  status?: PointTransactionStatus;

  @IsOptional()
  @IsDateString()
  startDate?: string;
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class FindWeeklyVolumeDto extends PaginationDto {
  @IsOptional()
  @IsEnum(VolumeProcessingStatus)
  status?: VolumeProcessingStatus;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
