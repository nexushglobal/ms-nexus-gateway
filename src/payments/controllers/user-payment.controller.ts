import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { UserId } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PaginationHelper } from 'src/common/helpers/pagination.helper';
import { PAYMENT_SERVICE } from 'src/config/services';
import { PaymentFiltersDto } from '../dto/payment-filter.dto';

@Controller('user/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserPaymentsController {
  constructor(
    @Inject(PAYMENT_SERVICE) private readonly paymentClient: ClientProxy,
  ) {}

  @Get()
  async getUserPayments(
    @UserId() userId: string,
    @Query() filtersDto: PaymentFiltersDto,
  ) {
    const { page, limit, offset, filters } =
      PaginationHelper.validatePaginationParams(
        filtersDto.page,
        filtersDto.limit,
        {
          search: filtersDto.search,
          sortBy: filtersDto.sortBy,
          sortOrder: filtersDto.sortOrder,
          startDate: filtersDto.startDate,
          endDate: filtersDto.endDate,
          status: filtersDto.status,
          paymentConfigId: filtersDto.paymentConfigId,
        },
      );

    const result = await firstValueFrom(
      this.paymentClient.send(
        { cmd: 'payment.getUserPayments' },
        {
          userId,
          limit,
          offset,
          filters,
        },
      ),
    );

    const activePaymentConfigs = await firstValueFrom(
      this.paymentClient.send({ cmd: 'payment.getActivePaymentConfigs' }, {}),
    );

    const paginatedData = PaginationHelper.createPaginatedResponse(
      result.payments,
      { page, limit, total: result.total },
      filters,
    );

    return {
      ...paginatedData,
      meta: {
        activePaymentConfigs: activePaymentConfigs || [],
      },
    };
  }
}
