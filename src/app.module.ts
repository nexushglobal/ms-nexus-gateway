import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { INTEGRATION_SERVICE, USERS_SERVICE } from './config/services';
import { envs } from './config/envs';
import { UsersController } from './users/users.controller';
import { IntegrationController } from './integration/integration.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: USERS_SERVICE,
        transport: Transport.NATS,
        options: {
          servers: [envs.NATS_SERVERS],
        },
      },
      {
        name: INTEGRATION_SERVICE,
        transport: Transport.NATS,
        options: {
          servers: [envs.NATS_SERVERS],
        },
      },
    ]),
  ],
  controllers: [UsersController, IntegrationController],
  providers: [],
})
export class AppModule {}
