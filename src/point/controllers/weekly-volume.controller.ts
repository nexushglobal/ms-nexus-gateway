import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UserId } from 'src/common/decorators/current-user.decorator';
import { POINT_SERVICE } from 'src/config/services';
import { CreateVolumeDto } from '../dto/create-volume.dto';
import { FindWeeklyVolumeDto } from '../dto/find-weekly-volume.dto';

@Controller('weekly-volume')
export class WeeklyVolumeController {
  constructor(
    @Inject(POINT_SERVICE) private readonly pointClient: ClientProxy,
  ) {}
  @Post('create')
  createVolume(@Body() body: CreateVolumeDto) {
    return this.pointClient.send({ cmd: 'weeklyVolume.createVolume' }, body);
  }

  @Get('volume')
  getVolumeUser(@UserId() userId: string, @Query() dto: FindWeeklyVolumeDto) {
    return this.pointClient.send(
      { cmd: 'weeklyVolume.getUserWeeklyVolumes' },
      {
        userId,
        ...dto,
      },
    );
  }

  @Get('volume/:id')
  getVolumeById(@UserId() userId: string, @Param('id') id: number) {
    return this.pointClient.send(
      { cmd: 'weeklyVolume.getWeeklyVolumeDetail' },
      {
        id,
      },
    );
  }
  @Get('volume-history/:id')
  getVolumeHistoryById(
    // @UserId() userId: string,
    @Param('id') weeklyVolumeId: number,
  ) {
    return this.pointClient.send(
      { cmd: 'weeklyVolume.getWeeklyVolumeHistory' },
      {
        // userId,
        weeklyVolumeId,
      },
    );
  }
}
