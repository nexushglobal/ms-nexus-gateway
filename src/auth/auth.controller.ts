import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Throttle } from '@nestjs/throttler';
import { Public } from 'src/common/decorators/public.decorator';
import { AUTH_SERVICE } from '../config/services';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Public()
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AUTH_SERVICE)
    private readonly authClient: ClientProxy,
  ) {}

  @Post('login')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
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
