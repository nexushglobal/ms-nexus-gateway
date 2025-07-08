import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs } from 'src/config/envs';
import { AUTH_SERVICE, PAYMENT_SERVICE } from 'src/config/services';
import { UserPaymentsController } from './controllers/user-payment.controller';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { CustomThrottlerGuard } from 'src/common/guards/custom-throttler.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { TimeoutInterceptor } from 'src/common/interceptors/timeout.interceptor';
import { FileTypeFixInterceptor } from 'src/common/interceptors/file-type-fix.interceptor';
import { AdminPaymentsController } from './controllers/admin-payments.controller';

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
    ]),
  ],
  controllers: [UserPaymentsController, AdminPaymentsController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
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
