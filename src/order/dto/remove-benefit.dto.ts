import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class RemoveBenefitDto {
  @IsString({ message: 'El beneficio debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El beneficio es requerido' })
  @Transform(({ value }) => value?.trim())
  benefit: string;
}
