import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  ParseFilePipeBuilder,
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
import { CreateMembershipSubscriptionDto } from '../dto/create-membership-subscription.dto';

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
          fileIsRequired: true,
        }),
    )
    files: Array<Express.Multer.File>,
  ) {
    return this.membershipClient.send(
      { cmd: 'membership.createSubscription' },
      {
        userId,
        createDto,
        files: files.map((file) => ({
          originalname: file.originalname,
          buffer: file.buffer,
        })),
      },
    );
  }

  @Get('detail')
  getMembershipDetail(@UserId() userId: string) {
    console.log('hola, estoy aqui');
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
}
