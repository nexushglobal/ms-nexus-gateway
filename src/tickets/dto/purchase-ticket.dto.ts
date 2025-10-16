import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsPositive } from 'class-validator';

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  TRANSFER = 'TRANSFER',
  CASH = 'CASH',
}

export class PurchaseTicketDto {
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  eventId: number;

  @IsEnum(PaymentMethod, {
    message: 'The payment method must be a valid PaymentMethod',
  })
  paymentMethod: PaymentMethod;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  pricePaid: number;
}
