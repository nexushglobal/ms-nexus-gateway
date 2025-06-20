import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UserRole } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { USERS_SERVICE } from '../config/services';

@Controller('user/menu')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MenuController {
  constructor(
    @Inject(USERS_SERVICE) private readonly userClient: ClientProxy,
  ) {}

  @Get()
  async getUserMenu(
    @UserRole() role: { id: string; code: string; name: string },
  ) {
    const viewsResponse = await this.userClient
      .send({ cmd: 'user.view.getViewsByRoleId' }, { roleId: role.id })
      .toPromise();

    if (!viewsResponse.success) {
      return {
        views: [],
      };
    }

    return {
      views: this.formatViews(viewsResponse.views),
    };
  }

  private formatViews(views: any[]): any[] {
    return views.map((view) => ({
      id: view.id,
      code: view.code,
      name: view.name,
      icon: view.icon || null,
      url: view.url || null,
      order: view.order,
      metadata: view.metadata || null,
      children: Array.isArray(view.children)
        ? this.formatViews(view.children as any[])
        : [],
    }));
  }
}
