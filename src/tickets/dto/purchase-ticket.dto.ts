import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export enum PaymentMethod {
  VOUCHER = 'VOUCHER',
  POINTS = 'POINTS',
  PAYMENT_GATEWAY = 'PAYMENT_GATEWAY',
}

export class PurchaseTicketDto {
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  eventId: number;

  @IsEnum(PaymentMethod, {
    message: 'The payment method must be VOUCHER, POINTS or PAYMENT_GATEWAY',
  })
  paymentMethod: PaymentMethod;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  pricePaid: number;

  // Para VOUCHER - enviar información del voucher
  @IsOptional()
  @IsArray()
  payments?: any[];

  // Para PAYMENT_GATEWAY (Culqi) - token del pago
  @IsOptional()
  @IsString()
  source_id?: string;
}
