import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { USERS_SERVICE } from '../config/services';

@Controller('users')
export class UsersController {
  constructor(
    @Inject(USERS_SERVICE) private readonly userClient: ClientProxy,
  ) {}

  @Get('hello')
  getUserHello(@Query('name') name?: string): Observable<any> {
    return this.userClient.send({ cmd: 'user.hello' }, { name });
  }

  @Get('health')
  getUserHealth(): Observable<any> {
    return this.userClient.send({ cmd: 'user.health' }, {});
  }
}
