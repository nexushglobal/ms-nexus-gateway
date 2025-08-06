import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UserId } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { ORDER_SERVICE } from 'src/config/services';
import { ExcelStockUpdateDto } from '../dto/excel-stock-update.dto';
import { StockHistoryDto } from '../dto/stock-history.dto';

@Controller('product-stock-history')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductStockHistoryController {
  constructor(
    @Inject(ORDER_SERVICE)
    private readonly orderClient: ClientProxy,
  ) {}

  @Get(':id/stock')
  // @Roles('SYS', 'FAC')
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

  @Post(':id/stock')
  @Roles('SYS', 'FAC')
  createStockHistory(
    @Param('id') id: number,
    @UserId() userId: string,
    @Body() productStockHistoryDto: StockHistoryDto,
  ) {
    return this.orderClient.send(
      { cmd: 'products.createStockHistory' },
      {
        productId: id,
        userId,
        ...productStockHistoryDto,
      },
    );
  }

  @Patch('bulk-update')
  // @Roles('SYS', 'FAC')
  updateStockHistory(
    @UserId() userId: string,
    @Body() excelStockUpdateDto: ExcelStockUpdateDto[],
  ) {
    return this.orderClient.send(
      { cmd: 'products.bulkUpdateStock' },
      {
        userId,
        products: excelStockUpdateDto,
      },
    );
  }
}
