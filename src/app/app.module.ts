import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs } from 'src/config/envs';
import { APP_SERVICE, AUTH_SERVICE } from 'src/config/services';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ComplaintsController } from './controllers/complaints-book.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: AUTH_SERVICE,
        transport: Transport.NATS,
        options: {
          servers: [envs.NATS_SERVERS],
        },
      },
      {
        name: APP_SERVICE,
        transport: Transport.NATS,
        options: {
          servers: [envs.NATS_SERVERS],
        },
      },
    ]),
  ],
  controllers: [AppController, ComplaintsController],
  providers: [AppService],
})
export class AppDashboardModule {}
