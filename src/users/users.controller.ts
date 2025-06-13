import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { USERS_SERVICE } from '../config/services';

@Controller('users')
export class UsersController {
  constructor(
    @Inject(USERS_SERVICE) private readonly userClient: ClientProxy,
  ) {}
  @Post('infoEmail')
  getInfo(@Body() payload: { email: string }) {
    return this.userClient.send(
      { cmd: 'user.findByEmailWithPassword' },
      payload,
    );
  }
}
