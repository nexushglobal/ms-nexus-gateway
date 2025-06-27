import { Type } from 'class-transformer';
import { IsInt, IsPositive } from 'class-validator';

export class PaymentDetailDto {
  @Type(() => Number)
  @IsInt({ message: 'El ID del pago debe ser un número entero' })
  @IsPositive({ message: 'El ID del pago debe ser positivo' })
  id: number;
}
