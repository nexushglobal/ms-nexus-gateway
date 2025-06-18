import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Throttle } from '@nestjs/throttler';
import { Public } from 'src/common/decorators/public.decorator';
import { USERS_SERVICE } from '../config/services';
import {
  PasswordResetRequestDto,
  ResetPasswordDto,
  ValidateResetTokenDto,
} from './dto/password-reset.dto';

@Public()
@Controller('auth/password-reset')
export class PasswordResetController {
  constructor(
    @Inject(USERS_SERVICE) private readonly userClient: ClientProxy,
  ) {}

  @Post('request')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 intentos por minuto
  requestPasswordReset(@Body() dto: PasswordResetRequestDto) {
    return this.userClient.send(
      { cmd: 'user.passwordReset.request' },
      { email: dto.email },
    );
  }

  @Post('validate-token')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 intentos por minuto
  validateResetToken(@Body() dto: ValidateResetTokenDto) {
    return this.userClient.send(
      { cmd: 'user.passwordReset.validateToken' },
      { email: dto.email, token: dto.token },
    );
  }

  @Post('reset')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 intentos por minuto
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.userClient.send(
      { cmd: 'user.passwordReset.reset' },
      {
        email: dto.email,
        token: dto.token,
        newPassword: dto.newPassword,
      },
    );
  }
}
