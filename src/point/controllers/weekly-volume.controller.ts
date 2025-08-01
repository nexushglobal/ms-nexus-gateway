import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { POINT_SERVICE } from 'src/config/services';
import { CreateVolumeDto } from '../dto/create-volume.dto';

@Controller('weekly-volume')
export class WeeklyVolumeController {
  constructor(
    @Inject(POINT_SERVICE) private readonly pointClient: ClientProxy,
  ) {}
  @Post('create')
  createVolume(@Body() body: CreateVolumeDto) {
    return this.pointClient.send({ cmd: 'weeklyVolume.createVolume' }, body);
  }
}
