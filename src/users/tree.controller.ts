import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserId } from 'src/common/decorators/current-user.decorator';
import { USERS_SERVICE } from '../config/services';
import { TreeQueryDto, TreeSearchDto } from './dto/tree-query.dto';

@Controller('users/tree')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TreeController {
  constructor(
    @Inject(USERS_SERVICE) private readonly userClient: ClientProxy,
  ) {}

  @Get()
  getUserTree(@UserId() currentUserId: string, @Query() query: TreeQueryDto) {
    const { userId, depth = 3 } = query;

    return this.userClient.send(
      { cmd: 'user.tree.getUserTree' },
      {
        userId,
        depth,
        currentUserId,
      },
    );
  }

  @Get('search')
  searchUsersInTree(
    @UserId() currentUserId: string,
    @Query() query: TreeSearchDto,
  ) {
    const { search, page = 1, limit = 20 } = query;
    console.log('Search query:', search);

    return this.userClient.send(
      { cmd: 'user.tree.searchUsers' },
      {
        search,
        page,
        limit,
        currentUserId,
      },
    );
  }
}
