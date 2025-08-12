import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { UserId } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PAYMENT_SERVICE } from 'src/config/services';
import { ApproveWithdrawalDto } from '../dto/approve-withdrawal.dto';
import { CreateWithdrawalDto } from '../dto/create-withdrawal.dto';
import { FindWithdrawalsDto } from '../dto/find-withdrawals.dto';
import { RejectWithdrawalDto } from '../dto/reject-withdrawal.dto';

@Controller('withdrawals')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WithdrawalsController {
  constructor(
    @Inject(PAYMENT_SERVICE)
    private readonly withdrawalClient: ClientProxy,
  ) {}

  @Post()
  async createWithdrawal(@Body() createWithdrawalDto: CreateWithdrawalDto) {
    return firstValueFrom(
      this.withdrawalClient.send(
        { cmd: 'withdrawals.create' },
        createWithdrawalDto,
      ),
    );
  }

  @Get()
  async getAllWithdrawals(@Query() filtersDto: FindWithdrawalsDto) {
    return firstValueFrom(
      this.withdrawalClient.send({ cmd: 'withdrawals.findAll' }, filtersDto),
    );
  }

  @Get(':id')
  async getWithdrawalDetail(@Param('id', ParseIntPipe) id: number) {
    return firstValueFrom(
      this.withdrawalClient.send({ cmd: 'withdrawals.findOne' }, { id }),
    );
  }

  @Get('clients/list')
  async getWithdrawalUser(
    @UserId() userId: string,
    @Query() filters: FindWithdrawalsDto,
  ) {
    return firstValueFrom(
      this.withdrawalClient.send(
        { cmd: 'withdrawals.findUserWithdrawals' },
        { userId, filters },
      ),
    );
  }

  @Post(':id/approve')
  approveWithdrawal(
    @Param('id', ParseIntPipe) withdrawalId: number,
    @Body() body: ApproveWithdrawalDto,
  ) {
    return firstValueFrom(
      this.withdrawalClient.send(
        { cmd: 'withdrawals.approve' },
        {
          withdrawalId,
          reviewerId: body.userId,
          reviewerEmail: body.userEmail,
        },
      ),
    );
  }

  @Post(':id/reject')
  rejectWithdrawal(
    @Param('id', ParseIntPipe) withdrawalId: number,
    @Body() body: RejectWithdrawalDto,
  ) {
    return firstValueFrom(
      this.withdrawalClient.send(
        { cmd: 'withdrawals.reject' },
        {
          withdrawalId,
          reviewerId: body.userId,
          reviewerEmail: body.userEmail,
          rejectionReason: body.rejectionReason,
        },
      ),
    );
  }
}
