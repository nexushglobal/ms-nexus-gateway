import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ORDER_SERVICE } from 'src/config/services';
import { FindProductsDto } from '../dto/find-products.dto';

@Controller('products')
export class ProductsController {
  constructor(
    @Inject(ORDER_SERVICE)
    private readonly orderClient: ClientProxy,
  ) {}

  @Get()
  findAll(@Query() findProductsDto: FindProductsDto) {
    return this.orderClient.send({ cmd: 'products.findAll' }, findProductsDto);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.orderClient.send({ cmd: 'products.findOne' }, { id });
  }

  @Get('list/sku-and-name')
  findSkuAndName() {
    return this.orderClient.send({ cmd: 'products.findAllWithSkuAndName' }, {});
  }
}
