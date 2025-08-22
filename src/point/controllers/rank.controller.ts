import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UserId } from 'src/common/decorators/current-user.decorator';
import { POINT_SERVICE } from 'src/config/services';

@Controller('rank')
export class RankController {
  constructor(
    @Inject(POINT_SERVICE) private readonly pointClient: ClientProxy,
  ) {}

  @Get('current')
  getCurrentRank(@UserId() userId: string) {
    return this.pointClient.send({ cmd: 'rank.getCurrentRank' }, { userId });
  }
}
