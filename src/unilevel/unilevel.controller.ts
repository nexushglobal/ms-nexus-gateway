import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UNILEVEL_SERVICE } from 'src/config/services';
import { FindAllLotsDto } from './dto/find-all-lots.dto';
import { CalculateAmortizationDto } from './dto/calculate-amortizacion-dto';
import { CreateUpdateLeadDto } from './dto/create-update-lead.dto';
import { CreateClientAndGuarantorDto } from './dto/create-client-and-guarantor.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UserId } from 'src/common/decorators/current-user.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreatePaymentSaleDto } from './dto/create-payment-sale.dto';
import { PaidInstallmentsDto } from './dto/paid-installments.dto';

@Controller('unilevel/external')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CLI')
export class UnilevelController {
  constructor(
    @Inject(UNILEVEL_SERVICE) private readonly unilevelClient: ClientProxy,
  ) {}

  @Get('projects')
  getProjects() {
    return this.unilevelClient.send({ cmd: 'unilevel.getProjects' }, {});
  }

  @Get('projects/:projectId/stages')
  getStages(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.unilevelClient.send(
      { cmd: 'unilevel.getStages' },
      { projectId },
    );
  }

  @Get('stages/:stageId/blocks')
  getBlocks(@Param('stageId', ParseUUIDPipe) stageId: string) {
    return this.unilevelClient.send({ cmd: 'unilevel.getBlocks' }, { stageId });
  }

  @Get('blocks/:blockId/lots')
  getLots(@Param('blockId', ParseUUIDPipe) blockId: string) {
    return this.unilevelClient.send({ cmd: 'unilevel.getLots' }, { blockId });
  }

  @Get('projects/:projectId/lots')
  findLotsByProjectId(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query() findAllLotsDto: FindAllLotsDto,
  ) {
    return this.unilevelClient.send(
      { cmd: 'unilevel.findLotsByProjectId' },
      {
        projectId,
        ...findAllLotsDto,
      },
    );
  }

  // ============= CÁLCULOS =============
  @Post('calculate/amortization')
  calculateAmortization(@Body() calculateDto: CalculateAmortizationDto) {
    return this.unilevelClient.send(
      { cmd: 'unilevel.calculateAmortization' },
      calculateDto,
    );
  }

  // ============= LEADS =============
  @Post('leads')
  createOrUpdateLead(@Body() createUpdateLeadDto: CreateUpdateLeadDto) {
    return this.unilevelClient.send(
      { cmd: 'unilevel.createOrUpdateLead' },
      createUpdateLeadDto,
    );
  }

  // ============= CLIENTES Y GARANTES =============
  @Post('clients-and-guarantors')
  createClientAndGuarantor(
    @Body() clientGuarantorDto: CreateClientAndGuarantorDto,
  ) {
    return this.unilevelClient.send(
      { cmd: 'unilevel.createClientAndGuarantor' },
      clientGuarantorDto,
    );
  }

  // ============= VENTAS =============
  @Post('sales')
  createSale(@Body() createSaleDto: CreateSaleDto, @UserId() userId: string) {
    return this.unilevelClient.send(
      { cmd: 'unilevel.createSale' },
      { userId, ...createSaleDto },
    );
  }

  @Get('sales')
  findAllSales(
    @Query() paginationDto: PaginationDto,
    @UserId() userId: string,
  ) {
    return this.unilevelClient.send(
      { cmd: 'unilevel.findAllSales' },
      { userId, ...paginationDto },
    );
  }

  @Get('sales/:id')
  findOneSaleById(@Param('id', ParseUUIDPipe) id: string) {
    return this.unilevelClient.send(
      { cmd: 'unilevel.findOneSaleById' },
      { id },
    );
  }

  @Post('payments/sale/:id')
  @Roles('JVE', 'VEN')
  @UseInterceptors(FilesInterceptor('files'))
  createPaymentSale(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() createPaymentSaleDto: CreatePaymentSaleDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.unilevelClient.send(
      { cmd: 'unilevel.createPaymentSale' },
      {
        saleId: id,
        createPaymentSaleDto,
        files: this.prepareFilesForMicroservice(files),
      },
    );
  }

  @Post('financing/installments/paid/:financingId')
  @Roles('COB', 'SCO')
  @UseInterceptors(FilesInterceptor('files'))
  paidInstallments(
    @Param('financingId', ParseUUIDPipe) financingId: string,
    @Body() paidInstallmentsDto: PaidInstallmentsDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.unilevelClient.send(
      { cmd: 'unilevel.paidInstallments' },
      {
        financingId,
        amountPaid: paidInstallmentsDto.amountPaid,
        payments: paidInstallmentsDto.payments,
        files: this.prepareFilesForMicroservice(files),
      },
    );
  }

  private prepareFilesForMicroservice(files: Express.Multer.File[]): any[] {
    if (!files || files.length === 0) return [];
    return files.map((file) => ({
      originalname: file.originalname,
      mimetype: file.mimetype,
      buffer: file.buffer.toString('base64'),
      size: file.size,
    }));
  }
}
