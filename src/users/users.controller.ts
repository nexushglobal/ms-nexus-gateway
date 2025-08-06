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
import { Public } from 'src/common/decorators/public.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PaginationHelper } from 'src/common/helpers/pagination.helper';
import { USERS_SERVICE } from '../config/services';

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

  @Public()
  @Post('infoEmail')
  getInfo(@Body() payload: { email: string }) {
    return this.userClient.send(
      { cmd: 'user.findByEmailWithPassword' },
      payload,
    );
  }
}
