import {
  Controller,
  Inject,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { Observable } from 'rxjs';
import { PAYMENT_SERVICE } from '../../config/services';
import { Public } from '../../common/decorators/public.decorator';
import { MigrationBaseService } from '../services/migration-base.service';

@Public()
@Controller('migration/payments')
export class PaymentMigrationController {
  constructor(
    @Inject(PAYMENT_SERVICE)
    private readonly paymentClient: ClientProxy,
    private readonly migrationService: MigrationBaseService,
  ) {}

  @Post('payment-configs')
  @UseInterceptors(FileInterceptor('file'))
  migratePaymentConfigsFromFile(
    @UploadedFile() file: Express.Multer.File,
  ): Observable<any> {
    return this.migrationService.migrateSingleFileArray(
      this.paymentClient,
      file,
      'configuraciones de pago',
      'payment.migrate.paymentConfigs',
      'paymentConfigs',
    );
  }

  @Post('payments')
  @UseInterceptors(FileInterceptor('file'))
  migratePaymentsFromFile(
    @UploadedFile() file: Express.Multer.File,
  ): Observable<any> {
    return this.migrationService.migrateSingleFileArray(
      this.paymentClient,
      file,
      'pagos',
      'payment.migrate.payments',
      'payments',
    );
  }
}
