import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Public } from 'src/common/decorators/public.decorator';
import { PAYMENT_SERVICE } from 'src/config/services';

@Public()
@Controller('test-api')
export class TestApiController {
  constructor(
    @Inject(PAYMENT_SERVICE) private readonly paymentClient: ClientProxy,
  ) {}

  @Get('ancestors/:userId')
  getPaymentDetail(@Param('userId') userId: string) {
    return this.paymentClient.send(
      { cmd: 'user.getActiveAncestorsWithMembership' },
      { userId: userId },
    );
  }
}
