import {
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';

export class PaymentApprovedNotificationDto {
  @IsString()
  saleId: string;

  @IsString({ message: 'El nuevo estado de la venta es requerido' })
  saleStatus: string;

  @IsIn(['APPROVED', 'REJECTED'], {
    message: 'La acción debe ser APPROVED o REJECTED',
  })
  action: string;

  @IsOptional()
  @IsNumber()
  approvedAmount?: number;

  @IsOptional()
  @IsDateString()
  approvalDate?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  projectName?: string;
}
