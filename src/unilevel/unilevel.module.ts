import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { FileTypeFixInterceptor } from 'src/common/interceptors/file-type-fix.interceptor';
import { TimeoutInterceptor } from 'src/common/interceptors/timeout.interceptor';
import { envs } from 'src/config/envs';
import { AUTH_SERVICE, UNILEVEL_SERVICE } from 'src/config/services';
import { UnilevelExternalController } from './controllers/unilevel-external.controller';
import { UnilevelController } from './controllers/unilevel.controller';

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
  controllers: [UnilevelController, UnilevelExternalController],
})
export class UnilevelModule {}
