import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthUser } from '../interfaces/auth-user.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      this.logger.debug('No hay roles requeridos - acceso permitido');
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: AuthUser = request.user;

    if (!user) {
      this.logger.warn('Usuario no encontrado en el request');
      throw new ForbiddenException('Usuario no autenticado');
    }

    if (!user.role || !user.role.code) {
      this.logger.warn(`Usuario ${user.email} sin rol asignado`);
      throw new ForbiddenException('Usuario sin rol asignado');
    }

    const hasRole = requiredRoles.includes(user.role.code);

    if (!hasRole) {
      this.logger.warn(
        `Usuario ${user.email} con rol ${user.role.code} intentó acceder a recurso que requiere roles: ${requiredRoles.join(', ')}`,
      );
      throw new ForbiddenException(
        `Acceso denegado. Se requiere uno de los siguientes roles: ${requiredRoles.join(', ')}`,
      );
    }

    this.logger.debug(
      `Acceso autorizado para usuario ${user.email} con rol ${user.role.code} para roles requeridos: ${requiredRoles.join(', ')}`,
    );

    return true;
  }
}
