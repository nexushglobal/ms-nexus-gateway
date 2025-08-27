import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from '../interfaces/auth-user.interface';

export const CurrentUser = createParamDecorator(
  (
    data: keyof AuthUser | undefined,
    ctx: ExecutionContext,
  ): AuthUser | AuthUser[keyof AuthUser] | undefined => {
    const request = ctx.switchToHttp().getRequest();
    const user: AuthUser = request.user;
    return data ? user?.[data] : user;
  },
);

export const UserId = () => CurrentUser('id');
export const UserEmail = () => CurrentUser('email');
export const UserRole = () => CurrentUser('role');
export const UserName = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    const user: AuthUser = request.user;
    if (user?.personalInfo?.firstName && user?.personalInfo?.lastName) {
      return `${user.personalInfo.firstName} ${user.personalInfo.lastName}`;
    }
    return undefined;
  },
);
