import { IsNotEmpty, IsString } from 'class-validator';

export class RejectWithdrawalDto {
  @IsString({ message: 'El ID de usuario es una cadena de texto' })
  @IsNotEmpty({ message: 'El ID de usuario es requerido' })
  userId: string;

  @IsString({ message: 'El email del usuario es una cadena de texto' })
  @IsNotEmpty({ message: 'El email del usuario es requerido' })
  userEmail: string;

  @IsString({ message: 'La razón de rechazo es una cadena de texto' })
  @IsNotEmpty({ message: 'La razón de rechazo es requerida' })
  rejectionReason: string;
}
