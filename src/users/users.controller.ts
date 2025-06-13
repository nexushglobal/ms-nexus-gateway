import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginationHelper } from 'src/common/helpers/pagination.helper';
import { USERS_SERVICE } from '../config/services';
import { RegisterDto } from './dto/register.dto';

@Controller('users')
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

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.userClient.send({ cmd: 'user.register' }, registerDto);
  }

  @Post('infoEmail')
  getInfo(@Body() payload: { email: string }) {
    return this.userClient.send(
      { cmd: 'user.findByEmailWithPassword' },
      payload,
    );
  }
}
