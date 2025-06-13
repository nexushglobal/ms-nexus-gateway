// src/app.module.ts (para el Gateway - actualizado)
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  AUTH_SERVICE,
  INTEGRATION_SERVICE,
  USERS_SERVICE,
} from './config/services';
import { envs } from './config/envs';
import { UsersController } from './users/users.controller';
import { IntegrationController } from './integration/integration.controller';
import { MigrationController } from './migration/migration.controller';
import { AuthController } from './auth/auth.controller';

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
