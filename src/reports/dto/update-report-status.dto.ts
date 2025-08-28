import {
  IsNotEmpty,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateReportStatusDto {
  @IsNotEmpty({ message: 'El estado es requerido' })
  @IsBoolean({ message: 'isActive debe ser un booleano' })
  @Type(() => Boolean)
  isActive: boolean;
}