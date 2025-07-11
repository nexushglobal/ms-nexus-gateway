import {
  Controller,
  Get,
  Query,
  UseGuards,
  Logger,
  Param,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PaginationHelper } from 'src/common/helpers/pagination.helper';
import { PAYMENT_SERVICE } from 'src/config/services';
import { PaymentFiltersDto } from '../dto/payment-filter.dto';
import { PaymentDetailDto } from '../dto/payment-detail.dto';

@Controller('admin/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminPaymentsController {
  private readonly logger = new Logger(AdminPaymentsController.name);

  constructor(
    @Inject(PAYMENT_SERVICE) private readonly paymentClient: ClientProxy,
  ) {}

  @Get()
  @Roles('FAC')
  async getAllPayments(@Query() filtersDto: PaymentFiltersDto) {
    try {
      this.logger.log(
        `🔍 Solicitud de lista de pagos administrativos - Página: ${filtersDto.page}`,
      );

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
          { cmd: 'payment.admin.getAllPayments' },
          {
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

      this.logger.log(
        `✅ Lista de pagos obtenida exitosamente - ${result.payments?.length || 0} pagos`,
      );

      return {
        ...paginatedData,
        meta: {
          activePaymentConfigs: activePaymentConfigs || [],
        },
      };
    } catch (error) {
      this.logger.error('❌ Error obteniendo lista de pagos:', error);
      throw error;
    }
  }

  @Get(':id')
  @Roles('FAC')
  getPaymentDetail(@Param() params: PaymentDetailDto) {
    try {
      return this.paymentClient.send(
        { cmd: 'payment.admin.getPaymentDetail' },
        { paymentId: params.id },
      );
    } catch (error) {
      this.logger.error(
        `❌ Error obteniendo detalle del pago ${params.id}:`,
        error,
      );
      throw error;
    }
  }
}
