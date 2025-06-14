import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AUTH_SERVICE } from '../config/services';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Throttle } from '@nestjs/throttler';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AUTH_SERVICE)
    private readonly authClient: ClientProxy,
  ) {}

  @Public()
  @Post('login')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  login(@Body() loginDto: LoginDto) {
    return this.authClient.send({ cmd: 'auth.login' }, loginDto);
  }

  @Public()
  @Post('refresh')
  refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authClient.send({ cmd: 'auth.refreshToken' }, refreshTokenDto);
  }

  @Public()
  @Post('verify')
  verifyToken(@Body() data: { token: string }) {
    return this.authClient.send({ cmd: 'auth.verifyToken' }, data);
  }
}
