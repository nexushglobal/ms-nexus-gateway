import {
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UserId } from 'src/common/decorators/current-user.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { POINT_SERVICE } from 'src/config/services';
import { FindPointsTransactionDto } from '../dto/find-weekly-volume.dto';

@Controller('points-transaction')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PointsTransactionController {
  constructor(
    @Inject(POINT_SERVICE) private readonly pointClient: ClientProxy,
  ) {}

  @Get('transaction')
  getTransaction(
    @UserId() userId: string,
    @Query() findPointsTransactionDto: FindPointsTransactionDto,
  ) {
    return this.pointClient.send(
      { cmd: 'pointsTransaction.get' },
      {
        userId,
        ...findPointsTransactionDto,
      },
    );
  }

  @Get('transaction-details/:id')
  getPointsTransactionDetails(
    @UserId() userId: string,
    @Param('id', ParseIntPipe) id: number,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.pointClient.send(
      { cmd: 'pointsTransaction.getUserPointsTransactionPayments' },
      { id, userId, paginationDto },
    );
  }
}
