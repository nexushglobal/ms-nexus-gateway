import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export enum MembershipListOrderBy {
  NEWEST = 'NEWEST',
  OLDEST = 'OLDEST',
}

export class ListMembershipsQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  welcomeKitDelivered?: boolean;

  @IsOptional()
  @IsEnum(MembershipListOrderBy)
  orderBy?: MembershipListOrderBy;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number;
}
