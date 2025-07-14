import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UserId } from 'src/common/decorators/current-user.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { MEMBERSHIP_SERVICE } from 'src/config/services';

@Controller('membership-reconsumption')
export class MembershipReconsumptionController {
  constructor(
    @Inject(MEMBERSHIP_SERVICE)
    private readonly membershipReconsumptionClient: ClientProxy,
  ) {}

  @Get('with-membership')
  getMembershipReconsumption(
    @UserId() userId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.membershipReconsumptionClient.send(
      { cmd: 'membershipReconsumption.findByMembershipId' },
      { userId, ...paginationDto },
    );
  }
}
