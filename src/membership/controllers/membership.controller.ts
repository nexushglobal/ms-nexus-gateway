import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Param,
  ParseFilePipeBuilder,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UserId } from 'src/common/decorators/current-user.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { MEMBERSHIP_SERVICE } from 'src/config/services';
import {
  CreateMembershipSubscriptionDto,
  CreateReConsumptionDto,
} from '../dto/create-membership-subscription.dto';
import { ListMembershipsQueryDto } from '../dto/list-memberships.dto';
import { CreateManualSubscriptionDto } from '../dto/manual-subscription.dto';
import { UpdateWelcomeKitStatusDto } from '../dto/update-welcome-kit-status.dto';

@Controller('membership')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MembershipController {
  constructor(
    @Inject(MEMBERSHIP_SERVICE) private readonly membershipClient: ClientProxy,
  ) {}

  @Post('subscribe')
  @UseInterceptors(FilesInterceptor('paymentImages', 5))
  @UsePipes(new ValidationPipe({ transform: true }))
  createSubscription(
    @UserId() userId: string,
    @Body() createDto: CreateMembershipSubscriptionDto,
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|webp)$/,
        })
        .addMaxSizeValidator({
          maxSize: 1024 * 1024 * 5,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          fileIsRequired: false,
        }),
    )
    files: Array<Express.Multer.File>,
  ) {
    console.log('Creating membership subscription for user:', files);

    return this.membershipClient.send(
      { cmd: 'membership.createSubscription' },
      {
        userId,
        createDto,
        files: (files || []).map((file) => ({
          originalname: file.originalname,
          buffer: file.buffer,
          mimetype: file.mimetype,
          size: file.size,
        })),
      },
    );
  }

  @Post('reconsumption')
  @UseInterceptors(FilesInterceptor('paymentImages', 5))
  @UsePipes(new ValidationPipe({ transform: true }))
  createReConsumption(
    @UserId() userId: string,
    @Body() dto: CreateReConsumptionDto,
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|webp)$/,
        })
        .addMaxSizeValidator({
          maxSize: 1024 * 1024 * 5,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          fileIsRequired: false,
        }),
    )
    files: Array<Express.Multer.File>,
  ) {
    console.log('Creating membership re-consumption for user:', files);

    return this.membershipClient.send(
      { cmd: 'membership.createReConsumption' },
      {
        userId,
        dto,
        files: (files || []).map((file) => ({
          originalname: file.originalname,
          buffer: file.buffer,
          mimetype: file.mimetype,
          size: file.size,
        })),
      },
    );
  }

  @Post('manual-subscription')
  @UsePipes(new ValidationPipe({ transform: true }))
  createManualSubscription(@Body() dto: CreateManualSubscriptionDto) {
    console.log('Creating manual membership subscription:', dto);

    return this.membershipClient.send(
      { cmd: 'membership.createManualSubscription' },
      dto,
    );
  }

  @Get('detail')
  getMembershipDetail(@UserId() userId: string) {
    return this.membershipClient.send(
      { cmd: 'membership.getMembershipDetail' },
      { userId },
    );
  }

  @Get('history')
  getMembershipHistory(
    @UserId() userId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.membershipClient.send(
      { cmd: 'membershipHistory.findAllByMembershipId' },
      { userId, ...paginationDto },
    );
  }

  @Get('list')
  listMemberships(@Query() queryDto: ListMembershipsQueryDto) {
    return this.membershipClient.send(
      { cmd: 'membership.listMemberships' },
      queryDto,
    );
  }

  @Patch('welcome-kit/:membershipId')
  updateWelcomeKitStatus(
    @Param('membershipId') membershipId: string,
    @Body() updateDto: UpdateWelcomeKitStatusDto,
  ) {
    return this.membershipClient.send(
      { cmd: 'membership.updateWelcomeKitStatus' },
      {
        membershipId: parseInt(membershipId),
        welcomeKitDelivered: updateDto.welcomeKitDelivered,
      },
    );
  }
}
