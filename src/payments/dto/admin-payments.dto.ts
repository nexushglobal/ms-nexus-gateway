import { Transform, Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  IsDateString,
  IsIn,
} from 'class-validator';

export class GetAdminPaymentsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La página debe ser un número entero' })
  @Min(1, { message: 'La página debe ser mayor a 0' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite debe ser mayor a 0' })
  limit?: number = 20;

  @IsOptional()
  @IsString({ message: 'La búsqueda debe ser texto' })
  @Transform(({ value }: { value: string }) => value?.trim())
  search?: string;

  @IsOptional()
  @IsIn(['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'], {
    message:
      'El estado debe ser uno de: PENDING, APPROVED, REJECTED, COMPLETED',
  })
  status?: string;

  @IsOptional()
  @IsIn(['VOUCHER', 'POINTS', 'PAYMENT_GATEWAY'], {
    message:
      'El método de pago debe ser uno de: VOUCHER, POINTS, PAYMENT_GATEWAY',
  })
  paymentMethod?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de inicio debe tener formato válido YYYY-MM-DD' },
  )
  startDate?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de fin debe tener formato válido YYYY-MM-DD' },
  )
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La configuración de pago debe ser un número entero' })
  @Min(1, { message: 'La configuración de pago debe ser mayor a 0' })
  paymentConfigId?: number;
}
