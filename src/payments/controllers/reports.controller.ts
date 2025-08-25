import { Controller, Inject, Param, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { PAYMENT_SERVICE } from '../../config/services';

@Controller('reports-payments')
export class ReportsController {
  constructor(
    @Inject(PAYMENT_SERVICE) private readonly paymentClient: ClientProxy,
  ) {}

  @Post('liquidation/:id')
  getLiquidationReports(
    @Param('id') withdrawalId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.paymentClient.send(
      { cmd: 'reportsWithdrawal.generateLiquidation' },
      {
        withdrawalId,
        userDocumentNumber:
          user.billingInfo?.ruc || 'No registrado en el sistema',
        userRazonSocial:
          user.billingInfo?.razonSocial || 'No registrado en el sistema',
      },
    );
  }
}
