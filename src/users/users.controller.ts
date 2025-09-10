import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PaginationHelper } from 'src/common/helpers/pagination.helper';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import { USERS_SERVICE } from '../config/services';
import { DashboardDto } from './dto/dashboard.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    @Inject(USERS_SERVICE) private readonly userClient: ClientProxy,
  ) {}

  @Get()
  async getUsers(@Query() paginationDto: PaginationDto) {
    const { page, limit, offset } = PaginationHelper.validatePaginationParams(
      paginationDto.page,
      paginationDto.limit,
    );

    const result = await this.userClient
      .send({ cmd: 'user.findAll' }, { page, limit, offset })
      .toPromise();

    const paginatedData = PaginationHelper.createPaginatedResponse(
      result.users,
      { page, limit, total: result.total },
    );

    return paginatedData;
  }

  @Get('dashboard')
  getUsersDashboard(
    @Query() dashboardDto: DashboardDto,
    @CurrentUser() currentUser: AuthUser,
  ) {
    const { page, limit, sortBy, sortOrder } = dashboardDto;

    return this.userClient.send(
      { cmd: 'users.getUsersDashboard' },
      { page, limit, sortBy, sortOrder, currentUserId: currentUser.id },
    );
  }

  @Get('parent-chain')
  getParentChain(@CurrentUser() currentUser: AuthUser) {
    return this.userClient.send(
      { cmd: 'user.tree.getParentChain' },
      { userId: currentUser.id },
    );
  }

  @Public()
  @Post('infoEmail')
  getInfo(@Body() payload: { email: string }) {
    return this.userClient.send(
      { cmd: 'user.findByEmailWithPassword' },
      payload,
    );
  }
}
