import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateMembershipDto {
  @IsOptional()
  @IsBoolean()
  autoRenewal?: boolean;

  @IsOptional()
  @IsBoolean()
  useCard?: boolean;

  @IsOptional()
  @IsBoolean()
  isPointLot?: boolean;
}
