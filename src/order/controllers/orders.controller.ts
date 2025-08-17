// CONTROLADOR HTTP PARA EL GATEWAY DE ÓRDENES
// (Similar al que tienes para productos)

import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Param,
  ParseFilePipeBuilder,
  ParseIntPipe,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UserId } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { ORDER_SERVICE } from 'src/config/services';
import { CreateOrderDto } from '../dto/create-order.dto';
import { FindAllOrdersAdminDto } from '../dto/find-all-orders-admin.dto';
import { FindAllOrdersClientDto } from '../dto/find-all-orders-client.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(
    @Inject(ORDER_SERVICE)
    private readonly orderClient: ClientProxy,
  ) {}

  @Get('admin')
  @Roles('SYS', 'FAC')
  @UsePipes(new ValidationPipe({ transform: true }))
  findAllForAdmin(@Query() findAllOrdersAdminDto: FindAllOrdersAdminDto) {
    return this.orderClient.send(
      { cmd: 'orders.findAll' },
      findAllOrdersAdminDto,
    );
  }

  @Get('admin/:id')
  @Roles('SYS', 'FAC')
  findOneForAdmin(@Param('id', ParseIntPipe) orderId: number) {
    return this.orderClient.send({ cmd: 'orders.findOne' }, { orderId });
  }

  @Get('my-orders')
  @Roles('CLI')
  @UsePipes(new ValidationPipe({ transform: true }))
  findMyOrders(
    @UserId() userId: string,
    @Query() findAllOrdersClientDto: FindAllOrdersClientDto,
  ) {
    return this.orderClient.send(
      { cmd: 'orders.findAllWithClients' },
      { userId, ...findAllOrdersClientDto },
    );
  }

  @Get('my-orders/:id')
  @Roles('CLI')
  findMyOrder(@Param('id', ParseIntPipe) orderId: number) {
    return this.orderClient.send(
      { cmd: 'orders.findOneWithClients' },
      { orderId },
    );
  }

  @Post('create-order')
  @UseInterceptors(FilesInterceptor('paymentImages', 5))
  @UsePipes(new ValidationPipe({ transform: true }))
  createOrder(
    @UserId() userId: string,
    @Body() dto: CreateOrderDto,
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|webp)$/,
        })
        .addMaxSizeValidator({
          maxSize: 1024 * 1024 * 5,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          fileIsRequired: false,
        }),
    )
    files: Array<Express.Multer.File>,
  ) {
    console.log('Creating order for user:', files);

    return this.orderClient.send(
      { cmd: 'order.createOrder' },
      {
        userId,
        dto,
        files: files.map((file) => ({
          originalname: file.originalname,
          buffer: file.buffer,
          mimetype: file.mimetype,
          size: file.size,
        })),
      },
    );
  }
}
