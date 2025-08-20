import { Body, Controller, Get, Inject, Patch, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UserId } from 'src/common/decorators/current-user.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { MEMBERSHIP_SERVICE } from 'src/config/services';
import { UpdateMembershipDto } from '../dto/update-membership.dto';

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

  @Patch('update-membership')
  updateMembership(
    @UserId() userId: string,
    @Body() updateMembershipDto: UpdateMembershipDto,
  ) {
    return this.membershipReconsumptionClient.send(
      { cmd: 'membership.updateMembership' },
      { userId, ...updateMembershipDto },
    );
  }
}
