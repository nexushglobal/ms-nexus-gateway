import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs } from '../config/envs';
import { APP_SERVICE, AUTH_SERVICE } from '../config/services';
import { TicketsController } from './controllers/tickets.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: APP_SERVICE,
        transport: Transport.NATS,
        options: {
          servers: envs.NATS_SERVERS,
        },
      },
      {
        name: AUTH_SERVICE,
        transport: Transport.NATS,
        options: {
          servers: [envs.NATS_SERVERS],
        },
      },
    ]),
  ],
  controllers: [TicketsController],
})
export class TicketsModule {}
