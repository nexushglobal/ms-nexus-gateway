import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UserId } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { POINT_SERVICE } from 'src/config/services';
import { FindPointsTransactionDto } from '../dto/find-weekly-volume.dto';

@Controller('points-lots-transaction')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LotPointsTransactionController {
  constructor(
    @Inject(POINT_SERVICE) private readonly pointClient: ClientProxy,
  ) {}

  @Get('transaction')
  getTransaction(
    @UserId() userId: string,
    @Query() findPointsTransactionDto: FindPointsTransactionDto,
  ) {
    return this.pointClient.send(
      { cmd: 'pointsLotTransaction.get' },
      {
        userId,
        ...findPointsTransactionDto,
      },
    );
  }
}
