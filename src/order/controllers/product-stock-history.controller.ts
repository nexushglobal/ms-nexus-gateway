import {
  Controller,
  Get,
  Inject,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Roles } from 'src/common/decorators/roles.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { ORDER_SERVICE } from 'src/config/services';

@Controller('product-stock-history')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductStockHistoryController {
  constructor(
    @Inject(ORDER_SERVICE)
    private readonly orderClient: ClientProxy,
  ) {}

  @Get(':id/stock')
  @Roles('SYS', 'FAC')
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
