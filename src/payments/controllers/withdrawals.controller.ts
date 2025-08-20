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
import {
  CurrentUser,
  UserId,
} from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import {
  PAYMENT_SERVICE,
  POINT_SERVICE,
  USERS_SERVICE,
} from 'src/config/services';
import { CreateWithdrawalDto } from '../dto/create-withdrawal.dto';
import { FindWithdrawalsDto } from '../dto/find-withdrawals.dto';
import { RejectWithdrawalDto } from '../dto/reject-withdrawal.dto';
import { WithdrawalValidationResponseDto } from '../dto/withdrawal-validation.dto';

@Controller('withdrawals')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WithdrawalsController {
  constructor(
    @Inject(PAYMENT_SERVICE)
    private readonly withdrawalClient: ClientProxy,
    @Inject(USERS_SERVICE)
    private readonly usersClient: ClientProxy,
    @Inject(POINT_SERVICE)
    private readonly pointsClient: ClientProxy,
  ) {}

  @Post()
  @Roles('CLI')
  async createWithdrawal(@Body() createWithdrawalDto: CreateWithdrawalDto) {
    return firstValueFrom(
      this.withdrawalClient.send(
        { cmd: 'withdrawals.create' },
        createWithdrawalDto,
      ),
    );
  }

  @Get()
  @Roles('FAC', 'SYS')
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

  @Get('point/info/validate')
  async validateWithdrawal(
    @UserId() userId: string,
  ): Promise<WithdrawalValidationResponseDto> {
    try {
      // 1. Obtener datos del usuario
      const userInfo = await firstValueFrom(
        this.usersClient.send(
          { cmd: 'user.getUserWithdrawalInfo' },
          { userId },
        ),
      );

      // 2. Verificar retiros pendientes
      const pendingWithdrawals = await firstValueFrom(
        this.withdrawalClient.send(
          { cmd: 'withdrawals.checkPendingWithdrawals' },
          { userId },
        ),
      );

      // 3. Verificar puntos disponibles
      const pointsEligibility = await firstValueFrom(
        this.pointsClient.send(
          { cmd: 'userPoints.checkWithdrawalEligibility' },
          { userId },
        ),
      );

      // 4. Validar que todos los datos estén completos
      const requirements: string[] = [];
      let canWithdraw = true;

      // Validar campos obligatorios
      if (!userInfo.ruc || userInfo.ruc.trim() === '') {
        requirements.push('no tiene RUC');
        canWithdraw = false;
      }
      if (!userInfo.razonSocial || userInfo.razonSocial.trim() === '') {
        requirements.push('no tiene razón social');
        canWithdraw = false;
      }
      if (!userInfo.address || userInfo.address.trim() === '') {
        requirements.push('no tiene dirección');
        canWithdraw = false;
      }
      if (!userInfo.bankName || userInfo.bankName.trim() === '') {
        requirements.push('no tiene nombre del banco');
        canWithdraw = false;
      }
      if (!userInfo.accountNumber || userInfo.accountNumber.trim() === '') {
        requirements.push('no tiene número de cuenta');
        canWithdraw = false;
      }
      if (!userInfo.cci || userInfo.cci.trim() === '') {
        requirements.push('no tiene código CCI');
        canWithdraw = false;
      }
      if (!userInfo.phone || userInfo.phone.trim() === '') {
        requirements.push('no tiene teléfono');
        canWithdraw = false;
      }

      // Validar retiros pendientes
      if (pendingWithdrawals.hasPendingWithdrawals) {
        requirements.push('tiene un retiro pendiente');
        canWithdraw = false;
      }

      // Validar puntos mínimos
      if (!pointsEligibility.hasMinimumPoints) {
        requirements.push('la cantidad de puntos es menor a 100');
        canWithdraw = false;
      }

      // Construir respuesta
      const response: WithdrawalValidationResponseDto = {
        infoUser: {
          userId: userInfo.userId,
          userName: userInfo.userName,
          userEmail: userInfo.userEmail,
          documentType: userInfo.documentType,
          documentNumber: userInfo.documentNumber,
          ruc: userInfo.ruc,
          razonSocial: userInfo.razonSocial,
          address: userInfo.address,
          bankName: userInfo.bankName,
          accountNumber: userInfo.accountNumber,
          cci: userInfo.cci,
          phone: userInfo.phone,
        },
        canWithdraw,
        availablePoints: pointsEligibility.availablePoints,
      };

      // Solo agregar 'req' si hay requerimientos faltantes
      if (requirements.length > 0) {
        response.req = requirements;
      }

      return response;
    } catch (error) {
      console.error('Error validating withdrawal:', error);
      throw error;
    }
  }

  @Get('clients/list')
  @Roles('CLI')
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
  @Roles('FAC')
  approveWithdrawal(
    @Param('id', ParseIntPipe) withdrawalId: number,
    @CurrentUser() user: AuthUser,
  ) {
    return firstValueFrom(
      this.withdrawalClient.send(
        { cmd: 'withdrawals.approve' },
        {
          withdrawalId,
          reviewerId: user.id,
          reviewerEmail: user.email,
        },
      ),
    );
  }

  @Post(':id/reject')
  @Roles('FAC')
  rejectWithdrawal(
    @Param('id', ParseIntPipe) withdrawalId: number,
    @CurrentUser() user: AuthUser,
    @Body() body: RejectWithdrawalDto,
  ) {
    return firstValueFrom(
      this.withdrawalClient.send(
        { cmd: 'withdrawals.reject' },
        {
          withdrawalId,
          reviewerId: user.id,
          reviewerEmail: user.email,
          rejectionReason: body.rejectionReason,
        },
      ),
    );
  }
}
