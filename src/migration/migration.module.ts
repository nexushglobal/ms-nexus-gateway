import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs } from '../config/envs';
import {
  MEMBERSHIP_SERVICE,
  PAYMENT_SERVICE,
  USERS_SERVICE,
} from '../config/services';
import { MembershipMigrationController } from './controllers/membership-migration.controller';
import { PaymentMigrationController } from './controllers/payment-migration.controller';
import { UserMigrationController } from './controllers/user-migration.controller';
import { MigrationBaseService } from './services/migration-base.service';

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
        name: PAYMENT_SERVICE,
        transport: Transport.NATS,
        options: {
          servers: [envs.NATS_SERVERS],
        },
      },
      {
        name: MEMBERSHIP_SERVICE,
        transport: Transport.NATS,
        options: {
          servers: [envs.NATS_SERVERS],
        },
      },
    ]),
  ],
  controllers: [
    UserMigrationController,
    PaymentMigrationController,
    MembershipMigrationController,
  ],
  providers: [MigrationBaseService],
  exports: [MigrationBaseService],
})
export class MigrationModule {}
