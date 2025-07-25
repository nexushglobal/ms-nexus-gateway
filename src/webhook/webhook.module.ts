import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs } from 'src/config/envs';
import { PAYMENT_SERVICE } from 'src/config/services';
import { CulqiChargeService } from './services/culqi-charge.service';
import { WebhookController } from './webhook.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: PAYMENT_SERVICE,
        transport: Transport.NATS,
        options: {
          servers: [envs.NATS_SERVERS],
        },
      },
    ]),
  ],
  controllers: [WebhookController],
  providers: [CulqiChargeService],
  exports: [CulqiChargeService],
})
export class WebhookModule {}
