import { Body, Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UserId } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { POINT_SERVICE } from 'src/config/services';
import { CreateDirectBonusDto } from '../dto/create-direct-bonus.dto';

@Controller('point')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserPointsController {
  constructor(
    @Inject(POINT_SERVICE) private readonly pointClient: ClientProxy,
  ) {}

  @Get('user-points')
  getUserPoints(@UserId() userId: string) {
    return this.pointClient.send({ cmd: 'userPoints.get' }, { userId });
  }

  @Get('user-lots-points')
  getUserLotsPoints(@UserId() userId: string) {
    return this.pointClient.send({ cmd: 'userLotsPoints.get' }, { userId });
  }

  @Post('create-direct-points')
  createDirectPoints(@Body() body: CreateDirectBonusDto) {
    return this.pointClient.send({ cmd: 'userPoints.createDirectBonus' }, body);
  }
}
