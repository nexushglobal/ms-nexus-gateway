import { IsNotEmpty, IsString } from 'class-validator';

export class RejectWithdrawalDto {
  @IsString({ message: 'La razón de rechazo es una cadena de texto' })
  @IsNotEmpty({ message: 'La razón de rechazo es requerida' })
  rejectionReason: string;
}
