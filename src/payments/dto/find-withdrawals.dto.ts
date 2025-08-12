import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { WithdrawalStatus } from '../enum/withdrawal-status';

export class FindWithdrawalsDto extends PaginationDto {
  @IsOptional()
  @IsEnum(WithdrawalStatus)
  status?: WithdrawalStatus;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;
}
