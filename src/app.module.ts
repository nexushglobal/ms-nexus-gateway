import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from './auth/auth.controller';
import { envs } from './config/envs';
import {
  AUTH_SERVICE,
  INTEGRATION_SERVICE,
  USERS_SERVICE,
} from './config/services';
import { IntegrationController } from './integration/integration.controller';
import { MigrationController } from './migration/migration.controller';
import { UsersController } from './users/users.controller';

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
      {
        name: AUTH_SERVICE,
        transport: Transport.NATS,
        options: {
          servers: [envs.NATS_SERVERS],
        },
      },
    ]),
  ],
  controllers: [
    UsersController,
    IntegrationController,
    MigrationController,
    AuthController,
  ],
  providers: [],
})
export class AppModule {}
