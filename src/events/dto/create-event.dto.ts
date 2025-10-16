import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export enum EventStatus {
  ACTIVO = 'Activo',
  INACTIVO = 'Inactivo',
  FINALIZADO = 'Finalizado',
  CANCELADO = 'Cancelado',
}

export class CreateEventDto {
  @IsString()
  @MaxLength(255, {
    message: 'The name cannot be longer than 255 characters',
  })
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsString()
  @Transform(({ value }) => value?.trim())
  description: string;

  @IsDate({ message: 'The start date must be a valid date' })
  @Type(() => Date)
  startDate: Date;

  @IsDate({ message: 'The end date must be a valid date' })
  @Type(() => Date)
  endDate: Date;

  @IsNumber()
  @IsPositive({ message: 'The member price must be positive' })
  @Min(0)
  @Type(() => Number)
  memberPrice: number;

  @IsNumber()
  @IsPositive({ message: 'The public price must be positive' })
  @Min(0)
  @Type(() => Number)
  publicPrice: number;

  @IsOptional()
  @IsEnum(EventStatus, {
    message: 'The status must be a valid EventStatus',
  })
  status?: EventStatus = EventStatus.ACTIVO;
}
