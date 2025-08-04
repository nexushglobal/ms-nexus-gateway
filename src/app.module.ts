import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ThrottlerModule } from '@nestjs/throttler';

import { AuthController } from './auth/auth.controller';
import { PasswordResetController } from './auth/password-reset.controller';
import { CustomThrottlerGuard } from './common/guards/custom-throttler.guard';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { FileTypeFixInterceptor } from './common/interceptors/file-type-fix.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { envs } from './config/envs';
import {
  AUTH_SERVICE,
  INTEGRATION_SERVICE,
  PAYMENT_SERVICE,
  POINT_SERVICE,
  UNILEVEL_SERVICE,
  USERS_SERVICE,
} from './config/services';
import { IntegrationController } from './integration/integration.controller';
import { MembershipModule } from './membership/membership.module';
import { PaymentsModule } from './payments/payments.module';
import { PointModule } from './point/point.module';
import { UnilevelModule } from './unilevel/unilevel.module';
import { MenuController } from './users/menu.controller';
import { ProfileController } from './users/profile.controller';
import { TreeController } from './users/tree.controller';
import { UsersController } from './users/users.controller';
import { WebhookModule } from './webhook/webhook.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 10,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 50,
      },
      {
        name: 'long',
        ttl: envs.RATE_LIMIT_TTL,
        limit: envs.RATE_LIMIT_MAX,
      },
    ]),

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
      {
        name: POINT_SERVICE,
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
        name: UNILEVEL_SERVICE,
        transport: Transport.NATS,
        options: {
          servers: [envs.NATS_SERVERS],
        },
      },
    ]),

    PaymentsModule,

    MembershipModule,

    UnilevelModule,

    PointModule,

    WebhookModule,
  ],
  controllers: [
    MenuController,
    UsersController,
    IntegrationController,
    AuthController,
    ProfileController,
    TreeController,
    PasswordResetController,
  ],
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
export class AppModule {}
