import { PartialType } from '@nestjs/mapped-types';
import {
  IsBoolean,
  IsEmail,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  @Length(5, 100, {
    message: 'La dirección debe tener entre 5 y 100 caracteres.',
  })
  address: string;

  @IsString()
  @Length(2, 30, { message: 'La ciudad debe tener entre 2 y 30 caracteres.' })
  address_city: string;

  @IsString()
  @Length(2, 2, { message: 'El código del país debe tener 2 caracteres.' })
  country_code: string;

  @IsString()
  @IsEmail({}, { message: 'El correo electrónico debe ser válido.' })
  @Length(5, 50, {
    message: 'El correo electrónico debe tener entre 5 y 50 caracteres.',
  })
  email: string;

  @IsString()
  @Length(2, 50, { message: 'El nombre debe tener entre 2 y 50 caracteres.' })
  @Matches(/^[^0-9±!@£$%^&*_+§¡€#¢§¶•ªº«\\<>\-?:;|=.,]{2,50}$/, {
    message: 'El nombre solo puede contener letras y espacios.',
  })
  first_name: string;

  @IsString()
  @Length(2, 50, { message: 'El apellido debe tener entre 2 y 50 caracteres.' })
  @Matches(/^[^0-9±!@£$%^&*_+§¡€#¢§¶•ªº«\\<>\-?:;|=.,]{2,50}$/, {
    message: 'El apellido solo puede contener letras y espacios.',
  })
  last_name: string;

  @IsString()
  @Length(5, 15, {
    message: 'El número de teléfono debe tener entre 5 y 15 caracteres.',
  })
  phone_number: string;

  @IsOptional()
  metadata?: Record<string, any>;
}

export class CreateCardDto {
  @IsString()
  @Length(25, 25, {
    message: 'El tokenId debe tener exactamente 25 caracteres.',
  })
  tokenId: string;

  @IsOptional()
  @IsBoolean({ message: 'validate debe ser un valor booleano.' })
  validate?: boolean = true;

  @IsOptional()
  @IsObject({ message: 'authentication_3DS debe ser un objeto.' })
  authentication_3DS?: Record<string, any>;

  @IsOptional()
  @IsObject({ message: 'metadata debe ser un objeto.' })
  metadata?: Record<string, any>;
}

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {}
export class UpdateCardDto extends PartialType(CreateCardDto) {}
