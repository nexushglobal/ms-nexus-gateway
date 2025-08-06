import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PointTransactionType } from '../enums/points-transaction-type.enum';

export class DirectBonusUserDto {
  @IsString({ message: 'El campo ID de usuario es una cadena de texto' })
  @IsNotEmpty({ message: 'El campo ID de usuario es obligatorio' })
  userId: string;

  @IsString({ message: 'El campo nombre de usuario es una cadena de texto' })
  @IsNotEmpty({ message: 'El campo nombre de usuario es obligatorio' })
  userName: string; // Nombre del usuario que compró

  @IsString({ message: 'El campo email de usuario es una cadena de texto' })
  @IsNotEmpty({ message: 'El campo email de usuario es obligatorio' })
  userEmail: string; // Email del usuario que compró

  @IsString({
    message: 'El campo de referencia de pago es una cadena de texto',
  })
  @IsOptional()
  paymentReference?: string; // Referencia del pago de este usuario

  @IsString({ message: 'El campo de pago es una cadena de texto' })
  @IsOptional()
  paymentId?: string;

  @IsNumber({}, { message: 'El campo de bono directo es un número' })
  @IsNotEmpty({ message: 'El campo de bono directo es obligatorio' })
  directBonus: number; // Bono directo

  @IsObject({ message: 'El campo de metadata es un objeto' })
  @IsNotEmpty({ message: 'El campo de metadata es obligatorio' })
  metadata: Record<string, any>; // Metadata obligatoria

  @IsEnum(PointTransactionType)
  @IsNotEmpty({ message: 'El campo de tipo de transacción es obligatorio' })
  type: PointTransactionType; // Tipo de transacción de puntos
}

export class CreateDirectBonusDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DirectBonusUserDto)
  users: DirectBonusUserDto[];
}

export class ProcessedDirectBonusDto {
  referrerUserId: string; // ID del referente que recibió el bono
  referredUserId: string; // ID del usuario que compró
  bonusAmount: number; // Cantidad del bono otorgado
  paymentReference: string; // Referencia del pago
  transactionId: number; // ID de la transacción de puntos creada
}

export class FailedDirectBonusDto {
  userId: string; // ID del usuario que falló
  paymentReference: string; // Referencia del pago
  reason: string; // Razón del fallo
}

export class DirectBonusResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProcessedDirectBonusDto)
  processed: ProcessedDirectBonusDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FailedDirectBonusDto)
  failed: FailedDirectBonusDto[];
}
