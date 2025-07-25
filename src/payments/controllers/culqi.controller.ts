import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UserId } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PAYMENT_SERVICE, USERS_SERVICE } from 'src/config/services';
import {
  CreateCardDto,
  CreatePaymentDto,
  UpdateCardDto,
  UpdatePaymentDto,
} from '../dto/customer-culqi.dto';

@Controller('culqi/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CulqiController {
  constructor(
    @Inject(PAYMENT_SERVICE) private readonly paymentClient: ClientProxy,
    @Inject(USERS_SERVICE) private readonly userClient: ClientProxy,
  ) {}

  @Get('customer')
  getUserPayments(@UserId() userId: string) {
    return this.userClient.send({ cmd: 'user.getCustomerInfo' }, { userId });
  }

  @Post('customer')
  createUserPayment(@UserId() userId: string, @Body() dto: CreatePaymentDto) {
    return this.paymentClient.send(
      { cmd: 'culqi.createCustomer' },
      { userId, ...dto },
    );
  }

  @Patch('customer')
  updateUserPayment(@UserId() userId: string, @Body() dto: UpdatePaymentDto) {
    console.log('Updating user payment with data:', dto);
    return this.paymentClient.send(
      { cmd: 'culqi.updateCustomer' },
      { userId, data: { ...dto } },
    );
  }

  @Post('card')
  createCardPayment(@UserId() userId: string, @Body() dto: CreateCardDto) {
    console.log('Creating card payment with data:', dto);
    return this.paymentClient.send(
      { cmd: 'culqi.createCard' },
      { userId, ...dto },
    );
  }
  @Patch('card/:cardId')
  updateCardPayment(
    @UserId() userId: string,
    @Body() dto: UpdateCardDto,
    @Param('cardId') cardId: string,
  ) {
    return this.paymentClient.send(
      { cmd: 'culqi.updateCard' },
      { userId, cardId, data: { ...dto } },
    );
  }

  @Delete('card/:cardId')
  deleteCardPayment(@UserId() userId: string, @Param('cardId') cardId: string) {
    return this.paymentClient.send(
      { cmd: 'culqi.deleteCard' },
      { userId, cardId },
    );
  }

  @Get('card')
  getUserCards(@UserId() userId: string) {
    return this.paymentClient.send({ cmd: 'culqi.getCard' }, { userId });
  }
}
