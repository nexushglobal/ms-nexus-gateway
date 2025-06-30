import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class FindMembershipPlansDto {

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isActive?: boolean;
}
