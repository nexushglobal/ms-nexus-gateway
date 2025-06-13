import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { AUTH_SERVICE } from '../config/services';

import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'El correo debe tener un formato válido' })
  @IsNotEmpty({ message: 'El correo es requerido' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;
}

export class RefreshTokenDto {
  refreshToken: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AUTH_SERVICE)
    private readonly authClient: ClientProxy,
  ) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    console.log('Login attempt with:', loginDto);
    return this.authClient.send({ cmd: 'auth.login' }, loginDto);
  }

  @Post('refresh')
  refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Observable<any> {
    return this.authClient.send(
      { cmd: 'auth.refreshToken' },
      { refreshToken: refreshTokenDto.refreshToken },
    );
  }

  @Post('verify')
  verifyToken(@Body() data: { token: string }): Observable<any> {
    return this.authClient.send({ cmd: 'auth.verifyToken' }, data);
  }
}
