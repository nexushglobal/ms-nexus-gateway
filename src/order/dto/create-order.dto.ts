import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export enum PaymentMethod {
  VOUCHER = 'VOUCHER',
  POINTS = 'POINTS',
  PAYMENT_GATEWAY = 'PAYMENT_GATEWAY',
}

// DTO for individual payment details
export class PaymentDetailDto {
  @IsString()
  @IsOptional()
  @Transform(({ value }: { value: string }) => value?.trim())
  bankName?: string;

  @IsString()
  @IsNotEmpty({ message: 'La referencia de transacción es requerida' })
  @Transform(({ value }: { value: string }) => value?.trim())
  transactionReference: string;

  @IsDateString({}, { message: 'La fecha de transacción debe ser válida' })
  @IsNotEmpty({ message: 'La fecha de transacción es requerida' })
  transactionDate: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El monto debe ser un número válido con hasta 2 decimales' },
  )
  @Min(0, { message: 'El monto no puede ser negativo' })
  @IsNotEmpty({ message: 'El monto del pago es requerido' })
  @Type(() => Number)
  amount: number;

  @IsNumber()
  @IsNotEmpty({ message: 'El índice del archivo es requerido' })
  @Min(0, { message: 'El índice del archivo debe ser al menos 0' })
  @Type(() => Number)
  fileIndex: number;
}

// DTO for order item information
export class OrderItemDto {
  @IsNumber()
  @IsNotEmpty({ message: 'El ID del producto es requerido' })
  @Type(() => Number)
  productId: number;

  @IsNumber()
  @IsNotEmpty({ message: 'La cantidad es requerida' })
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  @Type(() => Number)
  quantity: number;
}

export class CreateOrderDto {
  @IsEnum(PaymentMethod, { message: 'Método de pago no válido' })
  paymentMethod: PaymentMethod;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message: 'El monto total debe ser un número válido con hasta 2 decimales',
    },
  )
  @Min(0, { message: 'El monto total no puede ser negativo' })
  @IsNotEmpty({ message: 'El monto total del pago es requerido' })
  @Type(() => Number)
  totalAmount: number;

  @IsOptional()
  @Transform(({ value }: { value: string }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed)
          ? plainToInstance(PaymentDetailDto, parsed)
          : [];
      } catch {
        return [];
      }
    }
    return value;
  })
  @IsArray({ message: 'Los detalles de pago deben ser un arreglo' })
  @ValidateNested({
    each: true,
    message: 'Cada detalle de pago debe ser un objeto válido',
  })
  @Type(() => PaymentDetailDto)
  payments?: PaymentDetailDto[];

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed)
          ? plainToInstance(OrderItemDto, parsed)
          : [];
      } catch {
        return [];
      }
    }
    return value;
  })
  @IsArray({ message: 'Los detalles de la orden deben ser un arreglo' })
  @ValidateNested({
    each: true,
    message: 'Cada item de la orden debe ser un objeto válido',
  })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional()
  @IsString()
  source_id?: string;
}
