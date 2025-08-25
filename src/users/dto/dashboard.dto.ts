import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Max, Min, IsIn } from 'class-validator';

export class DashboardDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive({ message: 'La página debe ser un número positivo' })
  @Min(1, { message: 'La página mínima es 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsPositive({ message: 'El límite debe ser un número positivo' })
  @Min(1, { message: 'El límite mínimo es 1' })
  @Max(100, { message: 'El límite máximo es 100' })
  limit?: number = 10;

  @IsOptional()
  @IsIn(['volume', 'lots'], { message: 'sortBy debe ser "volume" o "lots"' })
  sortBy?: 'volume' | 'lots' = 'volume';

  @IsOptional()
  @IsIn(['asc', 'desc'], { message: 'sortOrder debe ser "asc" o "desc"' })
  sortOrder?: 'asc' | 'desc' = 'desc';
}