import { Controller, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MEMBERSHIP_SERVICE } from 'src/config/services';

@Controller('membership')
export class MembershipController {
  constructor(
    @Inject(MEMBERSHIP_SERVICE) private readonly paymentClient: ClientProxy,
  ) {}
}
