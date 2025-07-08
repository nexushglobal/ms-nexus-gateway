import {
  Controller,
  Get,
  Query,
  UseGuards,
  Logger,
  Param,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { GetAdminPaymentsQueryDto } from '../dto/admin-payments.dto';
import { GetAdminPaymentDetailParamsDto } from '../dto/admin-payments-detail.dto';

@Controller('admin/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminPaymentsController {
  private readonly logger = new Logger(AdminPaymentsController.name);

  constructor(
    @Inject('PAYMENT_SERVICE') private readonly paymentClient: ClientProxy,
  ) {}

  @Get()
  @Roles('FAC')
  async getAllPayments(@Query() query: GetAdminPaymentsQueryDto) {
    try {
      this.logger.log(
        `🔍 Solicitud de lista de pagos administrativos - Página: ${query.page}`,
      );

      const result = await firstValueFrom(
        this.paymentClient.send({ cmd: 'payment.admin.getAllPayments' }, query),
      );

      this.logger.log(
        `✅ Lista de pagos obtenida exitosamente - ${result.payments?.length || 0} pagos`,
      );

      return {
        success: true,
        data: result.payments || [],
        pagination: result.pagination || {
          page: query.page || 1,
          limit: query.limit || 20,
          total: 0,
          totalPages: 0,
        },
        message: 'Lista de pagos obtenida exitosamente',
      };
    } catch (error) {
      this.logger.error('❌ Error obteniendo lista de pagos:', error);

      throw error;
    }
  }
  @Get(':id')
  @Roles('FAC')
  async getPaymentDetail(@Param() params: GetAdminPaymentDetailParamsDto) {
    try {
      this.logger.log(
        `🔍 Solicitud de detalle administrativo del pago: ${params.id}`,
      );

      const result = await firstValueFrom(
        this.paymentClient.send(
          { cmd: 'payment.admin.getPaymentDetail' },
          { paymentId: params.id },
        ),
      );

      this.logger.log(
        `✅ Detalle administrativo del pago ${params.id} obtenido exitosamente`,
      );

      return {
        success: true,
        data: result,
        message: 'Detalle del pago obtenido exitosamente',
      };
    } catch (error) {
      this.logger.error(
        `❌ Error obteniendo detalle del pago ${params.id}:`,
        error,
      );

      throw error;
    }
  }
  @Get('metadata')
  @Roles('FAC')
  async getPaymentMetadata() {
    try {
      this.logger.log('📋 Solicitud de metadatos de pagos');

      const result = await firstValueFrom(
        this.paymentClient.send({ cmd: 'payment.admin.getMetadata' }, {}),
      );

      this.logger.log('✅ Metadatos de pagos obtenidos exitosamente');

      return {
        success: true,
        data: result,
        message: 'Metadatos obtenidos exitosamente',
      };
    } catch (error) {
      this.logger.error('❌ Error obteniendo metadatos de pagos:', error);

      throw error;
    }
  }
}
