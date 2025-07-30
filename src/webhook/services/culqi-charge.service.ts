import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PAYMENT_SERVICE } from 'src/config/services';

@Injectable()
export class CulqiChargeService {
  private readonly logger = new Logger(CulqiChargeService.name);
  constructor(
    @Inject(PAYMENT_SERVICE) private readonly paymentsClient: ClientProxy,
  ) {}

  async handleChargeSuccess(paymentId: string, userId: string) {
    try {
      await firstValueFrom(
        this.paymentsClient.send(
          { cmd: 'payment.approve' },
          {
            id: paymentId,
            userId: userId,
            approvePaymentDto: {
              banckName: 'Culqi',
              dateOperation: new Date(),
            },
          },
        ),
      );

      this.logger.log(`Payment ${paymentId} approved successfully`);
    } catch (error) {
      this.logger.error(`Error approving payment ${paymentId}:`, error);
      throw error;
    }
  }

  async handleChargeFailure(paymentId: string, userId: string) {
    try {
      await firstValueFrom(
        this.paymentsClient.send(
          { cmd: 'payment.reject' },
          {
            id: paymentId,
            userId: userId,
            rejectPaymentDto: {
              rejectionReason:
                'Pago rechazado por fallo en la creación del cargo',
            },
          },
        ),
      );

      this.logger.log(`Payment ${paymentId} rejected due to charge failure`);
    } catch (error) {
      this.logger.error(`Error rejecting payment ${paymentId}:`, error);
      throw error;
    }
  }

  async handleChargeExpired(paymentId: string, userId: string) {
    try {
      await firstValueFrom(
        this.paymentsClient.send(
          { cmd: 'payment.reject' },
          {
            id: paymentId,
            userId: userId,
            rejectPaymentDto: {
              rejectionReason: 'El cargo ha expirado',
            },
          },
        ),
      );

      this.logger.log(`Payment ${paymentId} rejected due to charge expiration`);
    } catch (error) {
      this.logger.error(`Error rejecting expired payment ${paymentId}:`, error);
      throw error;
    }
  }

  async handleCaptureSuccess(paymentId: string, userId: string) {
    try {
      await firstValueFrom(
        this.paymentsClient.send(
          { cmd: 'payment.approve' },
          {
            id: paymentId,
            userId: userId,
            approvePaymentDto: {
              banckName: 'Culqi',
              dateOperation: new Date(),
            },
          },
        ),
      );

      this.logger.log(`Payment ${paymentId} capture confirmed and approved`);
    } catch (error) {
      this.logger.error(
        `Error processing capture success for payment ${paymentId}:`,
        error,
      );
      throw error;
    }
  }

  async handleCaptureFailure(paymentId: string, userId: string) {
    try {
      await firstValueFrom(
        this.paymentsClient.send(
          { cmd: 'payment.reject' },
          {
            id: paymentId,
            userId: userId,
            rejectPaymentDto: {
              rejectionReason: 'El cargo no pudo ser capturado',
            },
          },
        ),
      );

      this.logger.log(`Payment ${paymentId} rejected due to capture failure`);
    } catch (error) {
      this.logger.error(
        `Error rejecting payment ${paymentId} after capture failure:`,
        error,
      );
      throw error;
    }
  }
}
