import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AUTH_SERVICE } from '../config/services';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AUTH_SERVICE)
    private readonly authClient: ClientProxy,
  ) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authClient.send({ cmd: 'auth.login' }, loginDto);
  }

  @Post('refresh')
  refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authClient.send({ cmd: 'auth.refreshToken' }, refreshTokenDto);
  }

  @Post('verify')
  verifyToken(@Body() data: { token: string }) {
    return this.authClient.send({ cmd: 'auth.verifyToken' }, data);
  }
}
