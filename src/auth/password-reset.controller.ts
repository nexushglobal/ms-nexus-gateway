import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
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
  requestPasswordReset(@Body() dto: PasswordResetRequestDto) {
    return this.userClient.send(
      { cmd: 'user.passwordReset.request' },
      { email: dto.email },
    );
  }

  @Post('validate-token')
  validateResetToken(@Body() dto: ValidateResetTokenDto) {
    return this.userClient.send(
      { cmd: 'user.passwordReset.validateToken' },
      { email: dto.email, token: dto.token },
    );
  }

  @Post('reset')
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
