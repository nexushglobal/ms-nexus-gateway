import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class FindMembershipPlansDto {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }: { value: string }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isActive?: boolean;
}
