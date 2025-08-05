import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CustomThrottlerGuard } from 'src/common/guards/custom-throttler.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { FileTypeFixInterceptor } from 'src/common/interceptors/file-type-fix.interceptor';
import { TimeoutInterceptor } from 'src/common/interceptors/timeout.interceptor';
import { envs } from 'src/config/envs';
import { AUTH_SERVICE, ORDER_SERVICE } from 'src/config/services';
import { ProductCategoryController } from './controllers/product-category.controller';
import { ProductStockHistoryController } from './controllers/product-stock-history.controller';
import { ProductsController } from './controllers/products.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: ORDER_SERVICE,
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
    ProductCategoryController,
    ProductStockHistoryController,
    ProductsController,
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
export class OrderModule {}
