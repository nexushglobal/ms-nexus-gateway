import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CustomThrottlerGuard } from 'src/common/guards/custom-throttler.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { FileTypeFixInterceptor } from 'src/common/interceptors/file-type-fix.interceptor';
import { TimeoutInterceptor } from 'src/common/interceptors/timeout.interceptor';
import { envs } from 'src/config/envs';
import { AUTH_SERVICE, POINT_SERVICE } from 'src/config/services';
import { PointsTransactionController } from './controllers/points-transaction.controller';
import { UserPointsController } from './controllers/user-points.controller';

@Module({
  controllers: [UserPointsController, PointsTransactionController],
  imports: [
    ClientsModule.register([
      {
        name: POINT_SERVICE,
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
export class PointModule {}
