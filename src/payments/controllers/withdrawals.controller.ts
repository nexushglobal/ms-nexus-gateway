import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Param,
  ParseFilePipeBuilder,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { firstValueFrom } from 'rxjs';
import {
  CurrentUser,
  UserId,
} from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import { PAYMENT_SERVICE } from 'src/config/services';
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
  @Roles('CLI')
  async createWithdrawal(
    @Body() createWithdrawalDto: CreateWithdrawalDto,
    @CurrentUser() user: AuthUser,
  ) {
    return firstValueFrom(
      this.withdrawalClient.send(
        { cmd: 'withdrawals.create' },
        {
          ...createWithdrawalDto,
          userDocumentNumber:
            user.billingInfo?.ruc ?? 'Dato no registrado en el sistema',
          userRazonSocial:
            user.billingInfo?.razonSocial ?? 'Dato no registrado en el sistema',
        },
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

  @Post(':id/signature')
  @Roles('CLI')
  @UseInterceptors(FileInterceptor('signature'))
  @UsePipes(new ValidationPipe({ transform: true }))
  addSignatureToWithdrawal(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|webp)$/,
        })
        .addMaxSizeValidator({
          maxSize: 1024 * 1024 * 5, // 5MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          fileIsRequired: true,
        }),
    )
    file: Express.Multer.File,
  ) {
    const serializedFile = {
      buffer: file.buffer.toString('base64'),
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      fieldname: file.fieldname,
      encoding: file.encoding,
    };
    return this.withdrawalClient.send(
      { cmd: 'withdrawals.signReport' },
      {
        withdrawalId: id,
        userDocumentNumber:
          user.billingInfo?.ruc ?? 'Dato no registrado en el sistema',
        userRazonSocial:
          user.billingInfo?.razonSocial ?? 'Dato no registrado en el sistema',
        file: serializedFile,
      },
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
