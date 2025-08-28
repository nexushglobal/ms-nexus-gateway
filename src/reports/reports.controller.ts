import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { APP_SERVICE } from '../config/services';
import { CreateReportDto } from './dto/create-report.dto';
import { FindAllReportsDto } from './dto/find-all-reports.dto';
import { FindOneReportDto } from './dto/find-one-report.dto';
import { GenerateReportDto } from './dto/generate-report.dto';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Controller('reports')
export class ReportsController {
  constructor(
    @Inject(APP_SERVICE)
    private readonly appClient: ClientProxy,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('FAC')
  async createReport(@Body() createReportDto: CreateReportDto) {
    return firstValueFrom(
      this.appClient.send({ cmd: 'reports.create' }, createReportDto),
    );
  }

  @Get('active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('FAC', 'CLI')
  async findActiveReports() {
    return firstValueFrom(
      this.appClient.send({ cmd: 'reports.findAllActive' }, {}),
    );
  }

  @Get('download')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('FAC', 'CLI')
  async downloadReport(
    @Query() generateReportDto: GenerateReportDto,
    @Res() res: Response,
  ) {
    const result = await firstValueFrom(
      this.appClient.send({ cmd: 'reports.generateFile' }, generateReportDto),
    );

    const buffer = Buffer.from(result.buffer);

    res.setHeader('Content-Type', result.contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${result.filename}"`,
    );
    res.setHeader('Content-Length', buffer.length);

    res.send(buffer);
    res.end();
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('FAC', 'CLI')
  async findAllReports(@Query() findAllReportsDto: FindAllReportsDto) {
    return firstValueFrom(
      this.appClient.send({ cmd: 'reports.findAll' }, findAllReportsDto),
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('FAC', 'CLI')
  async findOneReport(@Param('id') id: string) {
    const findOneReportDto: FindOneReportDto = { id: +id };
    return firstValueFrom(
      this.appClient.send({ cmd: 'reports.findOne' }, findOneReportDto),
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('FAC')
  async updateReport(
    @Param('id') id: string,
    @Body() updateReportDto: UpdateReportDto,
  ) {
    const updateData = { id: +id, ...updateReportDto };
    return firstValueFrom(
      this.appClient.send({ cmd: 'reports.update' }, updateData),
    );
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('FAC')
  async updateReportStatus(
    @Param('id') id: string,
    @Body() updateReportStatusDto: UpdateReportStatusDto,
  ) {
    const updateData = { id: +id, ...updateReportStatusDto };
    return firstValueFrom(
      this.appClient.send({ cmd: 'reports.updateStatus' }, updateData),
    );
  }

  @Post('generate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('FAC', 'CLI')
  async generateReport(@Body() generateReportDto: GenerateReportDto) {
    return firstValueFrom(
      this.appClient.send({ cmd: 'reports.generate' }, generateReportDto),
    );
  }
}
