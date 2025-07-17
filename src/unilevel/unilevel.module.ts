import { Module } from '@nestjs/common';
import { UnilevelController } from './unilevel.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUTH_SERVICE, UNILEVEL_SERVICE } from 'src/config/services';
import { envs } from 'src/config/envs';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { CustomThrottlerGuard } from 'src/common/guards/custom-throttler.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { TimeoutInterceptor } from 'src/common/interceptors/timeout.interceptor';
import { FileTypeFixInterceptor } from 'src/common/interceptors/file-type-fix.interceptor';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: UNILEVEL_SERVICE,
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
  controllers: [UnilevelController],
})
export class UnilevelModule {}
