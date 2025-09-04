import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { APP_SERVICE } from '../config/services';
import { CreateLeadDto } from './dto/create-lead.dto';
import { DownloadLeadsDto } from './dto/download-leads.dto';
import { FindLeadsDto } from './dto/find-leads.dto';

@Controller('leads')
export class LeadsController {
  constructor(
    @Inject(APP_SERVICE)
    private readonly appClient: ClientProxy,
  ) {}

  @Post()
  @Public()
  async createLead(@Body() createLeadDto: CreateLeadDto) {
    return firstValueFrom(
      this.appClient.send({ cmd: 'leads.create' }, createLeadDto),
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('FAC')
  async getLeads(@Query() findLeadsDto: FindLeadsDto) {
    return firstValueFrom(
      this.appClient.send({ cmd: 'leads.findAll' }, findLeadsDto),
    );
  }

  @Get('download')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('FAC', 'CLI')
  async downloadLeads(
    @Query() downloadLeadsDto: DownloadLeadsDto,
    @Res() res: Response,
  ) {
    const result = await firstValueFrom(
      this.appClient.send({ cmd: 'leads.downloadCSV' }, downloadLeadsDto),
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
}
