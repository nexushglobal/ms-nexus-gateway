import {
  Body,
  Controller,
  HttpStatus,
  Inject,
  Logger,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Public } from 'src/common/decorators/public.decorator';
import { ApiKeyAuthGuard } from 'src/common/guards/api-key-auth.guard';
import { UNILEVEL_SERVICE } from 'src/config/services';
import { PaymentApprovedNotificationDto } from '../dto/payment-approved-notification.dto';

@Controller('unilevel/external')
@UseGuards(ApiKeyAuthGuard)
@Public()
export class UnilevelExternalController {
  private readonly logger = new Logger(UnilevelExternalController.name);
  constructor(
    @Inject(UNILEVEL_SERVICE)
    private readonly unilevelClient: ClientProxy,
  ) {}

  @Post('approved')
  async handlePaymentApproval(
    @Body() paymentData: PaymentApprovedNotificationDto,
  ) {
    try {
      this.logger.log(
        `Recibida notificación de pago aprobado: ${paymentData.saleId}`,
      );

      await firstValueFrom(
        this.unilevelClient.send(
          { cmd: 'unilevel.payment.approved' },
          paymentData,
        ),
      );

      this.logger.log(
        `Pago procesado exitosamente para venta: ${paymentData.saleId}`,
      );

      return {
        success: true,
        message: 'Pago procesado exitosamente',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      this.logger.error(
        `Error procesando pago aprobado para venta ${paymentData.saleId}:`,
        error.message,
      );

      return {
        success: false,
        message: 'Error procesando pago',
        error: error.message,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }
}
