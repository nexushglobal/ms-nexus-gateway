import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, Max } from 'class-validator';

export class TreeQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La profundidad debe ser un número entero' })
  @Min(1, { message: 'La profundidad mínima es 1' })
  @Max(5, { message: 'La profundidad máxima es 5' })
  depth?: number = 3;
}
