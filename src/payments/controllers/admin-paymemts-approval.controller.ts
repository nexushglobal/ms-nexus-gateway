import {
  Body,
  Controller,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UserId } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PAYMENT_SERVICE } from 'src/config/services';
import { ApprovePaymentDto } from '../dto/approve-payment.dto';
import { CompletePaymentDto } from '../dto/complete-payment.dto';
import { RejectPaymentDto } from '../dto/reject-payment.dto';

@Controller('admin/payments/approval')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('FAC', 'ADM', 'SYS')
export class AdminPaymentApprovalController {
  constructor(
    @Inject(PAYMENT_SERVICE) private readonly paymentClient: ClientProxy,
  ) {}

  @Post(':id/approve')
  approvePayment(
    @Param('id', ParseIntPipe) id: number,
    @UserId() userId: string,
    @Body() approvePaymentDto: ApprovePaymentDto,
  ) {
    return this.paymentClient.send(
      { cmd: 'payment.approve' },
      {
        id,
        userId,
        approvePaymentDto,
      },
    );
  }

  @Put(':id/complete')
  completePayment(
    @Param('id', ParseIntPipe) id: number,
    @UserId() userId: string,
    @Body() completePaymentDto: CompletePaymentDto,
  ) {
    return this.paymentClient.send(
      { cmd: 'payment.complete' },
      {
        id,
        userId,
        completePaymentDto,
      },
    );
  }

  @Post(':id/reject')
  rejectPayment(
    @Param('id', ParseIntPipe) id: number,
    @UserId() userId: string,
    @Body() rejectPaymentDto: RejectPaymentDto,
  ) {
    return this.paymentClient.send(
      { cmd: 'payment.reject' },
      {
        id,
        userId,
        rejectPaymentDto,
      },
    );
  }
}
