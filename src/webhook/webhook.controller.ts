import { Body, Controller, HttpException, Logger, Post } from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';
import { CulqiWebhookEvent } from './interfaces/culqi-webhook.interface';
import { CulqiChargeService } from './services/culqi-charge.service';

@Public()
@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly culqiChargeService: CulqiChargeService) {}

  @Post('culqi')
  async handleCulqiWebhook(@Body() event: CulqiWebhookEvent): Promise<void> {
    try {
      this.logger.log(
        `Received Culqi webhook: ${event.event} for charge: ${event.data.id}`,
      );

      // Validar que el evento sea de tipo charge
      if (event.data.object !== 'charge') {
        this.logger.warn(`Ignoring non-charge event: ${event.event}`);
        throw new HttpException('Invalid event type', 400);
      }

      // Validar que tengamos el ID del payment interno
      const internalPaymentId = event.data.metadata?.paymentId;
      if (!internalPaymentId) {
        this.logger.error('No internal payment ID found in webhook metadata');
        throw new HttpException('Internal payment ID not found', 400);
      }
      const userId = event.data.metadata?.userId;
      if (!userId) {
        this.logger.error('No user ID found in webhook metadata');
        throw new HttpException('User ID not found', 400);
      }

      // Procesar según el tipo de evento
      switch (event.event) {
        case 'charge.creation.succeeded':
          await this.culqiChargeService.handleChargeSuccess(
            internalPaymentId,
            userId,
          );
          break;

        case 'charge.creation.failed':
          await this.culqiChargeService.handleChargeFailure(
            internalPaymentId,
            userId,
          );
          break;

        case 'charge.expired':
          await this.culqiChargeService.handleChargeExpired(
            internalPaymentId,
            userId,
          );
          break;

        case 'charge.capture.succeeded':
          await this.culqiChargeService.handleCaptureSuccess(
            internalPaymentId,
            userId,
          );
          break;

        case 'charge.capture.failed':
          await this.culqiChargeService.handleCaptureFailure(
            internalPaymentId,
            userId,
          );
          break;

        default:
          this.logger.warn(`Unhandled webhook event: ${event.event}`);
          throw new HttpException('Unhandled event type', 400);
      }
    } catch (error) {
      this.logger.error('Error processing Culqi webhook:', error);
      throw new HttpException('Webhook processing failed', 500);
    }
  }
}
