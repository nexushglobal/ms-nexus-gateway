import {
  Controller,
  Inject,
  UseGuards,
  Query,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { MEMBERSHIP_SERVICE } from 'src/config/services';
import { ClientProxy } from '@nestjs/microservices';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserId } from 'src/common/decorators/current-user.decorator';
import { FindMembershipPlansDto } from '../dto/find-membership-plan.dto';

@Controller('membership-plan')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MembershipPlanController {
  constructor(
    @Inject(MEMBERSHIP_SERVICE)
    private readonly membershipPlanClient: ClientProxy,
  ) {}
  @Get()
  findAll(@UserId() userId: string, @Query() filters: FindMembershipPlansDto) {
    return this.membershipPlanClient.send(
      { cmd: 'membershipPlan.findAll' },
      {
        userId,
        isActive: filters.isActive,
      },
    );
  }

  @Get(':id')
  findOne(@UserId() userId: string, @Param('id', ParseIntPipe) id: number) {
    return this.membershipPlanClient.send(
      { cmd: 'membershipPlan.findOne' },
      { userId, id },
    );
  }
}
