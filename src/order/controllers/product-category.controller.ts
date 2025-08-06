import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { ORDER_SERVICE } from 'src/config/services';

@Controller('product-category')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductCategoryController {
  constructor(
    @Inject(ORDER_SERVICE)
    private readonly orderClient: ClientProxy,
  ) {}

  @Get()
  @Roles('SYS', 'FAC', 'CLI')
  findAll(@Query('includeInactive') includeInactive?: boolean) {
    return this.orderClient.send(
      { cmd: 'products.findAllCategories' },
      { includeInactive },
    );
  }
}
