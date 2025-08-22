import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UserId } from 'src/common/decorators/current-user.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { POINT_SERVICE } from 'src/config/services';
import { CreateMonthlyVolumeDto } from '../dto/create-monthly-volume.dto';

@Controller('monthly-volume')
export class MonthlyVolumeController {
  constructor(
    @Inject(POINT_SERVICE) private readonly pointClient: ClientProxy,
  ) {}

  @Post('create')
  createMonthlyVolume(@Body() body: CreateMonthlyVolumeDto) {
    return this.pointClient.send(
      { cmd: 'monthlyVolume.createMonthlyVolume' },
      body,
    );
  }

  @Get()
  getUserMonthlyVolumes(@UserId() userId: string, @Query() dto: PaginationDto) {
    return this.pointClient.send(
      { cmd: 'monthlyVolume.getUserMonthlyVolumes' },
      {
        userId,
        ...dto,
      },
    );
  }
}
