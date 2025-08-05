import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ORDER_SERVICE } from 'src/config/services';

@Controller('product-category')
export class ProductCategoryController {
  constructor(
    @Inject(ORDER_SERVICE)
    private readonly orderClient: ClientProxy,
  ) {}

  @Get()
  findAll(@Query('includeInactive') includeInactive?: boolean) {
    return this.orderClient.send(
      { cmd: 'products.findAllCategories' },
      { includeInactive },
    );
  }
}
