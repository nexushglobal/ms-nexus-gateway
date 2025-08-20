import { Controller, Inject, Param, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PAYMENT_SERVICE } from '../../config/services';

@Controller('reports-payments')
export class ReportsController {
  constructor(
    @Inject(PAYMENT_SERVICE) private readonly paymentClient: ClientProxy,
  ) {}

  @Post('liquidation/:id')
  getLiquidationReports(@Param('id') withdrawalId: string) {
    return this.paymentClient.send(
      { cmd: 'reportsWithdrawal.generateLiquidation' },
      { withdrawalId, userDocumentNumber: '70125834' },
    );
  }
}
