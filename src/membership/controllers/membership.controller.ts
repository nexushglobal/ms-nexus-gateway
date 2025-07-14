import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UserId } from 'src/common/decorators/current-user.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { MEMBERSHIP_SERVICE } from 'src/config/services';

@Controller('membership')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MembershipController {
  constructor(
    @Inject(MEMBERSHIP_SERVICE) private readonly membershipClient: ClientProxy,
  ) {}

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
