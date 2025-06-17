import {
  Controller,
  Get,
  Inject,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { USERS_SERVICE } from '../config/services';
import { TreeQueryDto } from './dto/tree-query.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TreeController {
  constructor(
    @Inject(USERS_SERVICE) private readonly userClient: ClientProxy,
  ) {}

  @Get(':id/tree')
  getUserTree(@Param('id') userId: string, @Query() query: TreeQueryDto) {
    const { depth = 3 } = query;

    return this.userClient.send(
      { cmd: 'user.tree.getUserTree' },
      { userId, depth },
    );
  }
}
