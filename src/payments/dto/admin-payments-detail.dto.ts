import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class GetAdminPaymentDetailParamsDto {
  @IsNotEmpty({ message: 'El ID del pago es requerido' })
  @Type(() => Number)
  @IsNumber({}, { message: 'El ID del pago debe ser un número' })
  @Min(1, { message: 'El ID del pago debe ser mayor a 0' })
  id: number;
}
