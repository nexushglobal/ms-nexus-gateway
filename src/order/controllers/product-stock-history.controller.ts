import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ORDER_SERVICE } from 'src/config/services';

@Controller('product-stock-history')
export class ProductStockHistoryController {
  constructor(
    @Inject(ORDER_SERVICE)
    private readonly orderClient: ClientProxy,
  ) {}

  @Get(':id/stock')
  findStockHistory(
    @Param('id') id: number,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.orderClient.send(
      { cmd: 'products.findStockHistory' },
      {
        productId: id,
        paginationDto,
      },
    );
  }
}
