import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { FileTypeFixInterceptor } from 'src/common/interceptors/file-type-fix.interceptor';
import { TimeoutInterceptor } from 'src/common/interceptors/timeout.interceptor';
import { envs } from 'src/config/envs';
import {
  AUTH_SERVICE,
  PAYMENT_SERVICE,
  USERS_SERVICE,
} from 'src/config/services';
import { AdminPaymentApprovalController } from './controllers/admin-paymemts-approval.controller';
import { AdminPaymentsController } from './controllers/admin-payments.controller';
import { CulqiController } from './controllers/culqi.controller';
import { UserPaymentsController } from './controllers/user-payment.controller';
import { WithdrawalsController } from './controllers/withdrawals.controller';

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
      {
        name: AUTH_SERVICE,
        transport: Transport.NATS,
        options: {
          servers: [envs.NATS_SERVERS],
        },
      },
      {
        name: USERS_SERVICE,
        transport: Transport.NATS,
        options: {
          servers: [envs.NATS_SERVERS],
        },
      },
    ]),
  ],
  controllers: [
    UserPaymentsController,
    AdminPaymentsController,
    AdminPaymentApprovalController,
    CulqiController,
    WithdrawalsController,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: FileTypeFixInterceptor,
    },
  ],
})
export class PaymentsModule {}
