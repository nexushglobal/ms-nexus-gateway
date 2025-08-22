import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  MEMBERSHIP_SERVICE,
  POINT_SERVICE,
  USERS_SERVICE,
} from 'src/config/services';
import { UserInfoResponseDto } from './types/user-info-response';

@Injectable()
export class DashboardService {
  constructor(
    @Inject(USERS_SERVICE)
    private readonly userClient: ClientProxy,

    @Inject(MEMBERSHIP_SERVICE)
    private readonly membershipClient: ClientProxy,

    @Inject(POINT_SERVICE)
    private readonly pointClient: ClientProxy,
  ) {}

  async getUserDashboard(userId: string) {
    const userData = await firstValueFrom<UserInfoResponseDto>(
      this.userClient.send({ cmd: 'get.user.info' }, { userId }),
    );

    const membershipData = await firstValueFrom(
      this.membershipClient.send(
        { cmd: 'membership.getUserMembershipStatus' },
        { userId },
      ),
    );

    const pointData = await firstValueFrom(
      this.pointClient.send({ cmd: 'userDashboard.get' }, { userId }),
    );

    const response = {
      userData: userData,
      membershipData: membershipData,
      pointData: pointData,
    };
    return response;
  }
}
