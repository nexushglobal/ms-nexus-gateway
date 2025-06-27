import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { PaymentStatus } from '../enum/payment-status.enum';

export class PaymentFiltersDto {
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
  limit?: number = 20;

  @IsOptional()
  @IsString({ message: 'El término de búsqueda debe ser texto' })
  search?: string;

  @IsOptional()
  @IsEnum(['ASC', 'DESC'], { message: 'El orden debe ser ASC o DESC' })
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  @IsEnum(['createdAt', 'amount', 'status', 'updatedAt'], {
    message:
      'El campo de ordenamiento debe ser createdAt, amount, status o updatedAt',
  })
  sortBy?: 'createdAt' | 'amount' | 'status' | 'updatedAt' = 'createdAt';

  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de inicio debe tener formato válido (YYYY-MM-DD)' },
  )
  startDate?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de fin debe tener formato válido (YYYY-MM-DD)' },
  )
  endDate?: string;

  @IsOptional()
  @IsEnum(PaymentStatus, {
    message: 'El status debe ser PENDING, APPROVED, REJECTED o COMPLETED',
  })
  status?: PaymentStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: 'El ID de configuración de pago debe ser un número entero',
  })
  @IsPositive({ message: 'El ID de configuración de pago debe ser positivo' })
  paymentConfigId?: number;
}
