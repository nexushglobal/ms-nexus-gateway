import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AUTH_SERVICE } from '../../config/services';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthUser } from '../interfaces/auth-user.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private reflector: Reflector,
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      this.logger.debug('Ruta pública - saltando autenticación');
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token de acceso requerido');
    }

    try {
      const result = await firstValueFrom(
        this.authClient.send({ cmd: 'auth.verifyToken' }, { token }),
      );

      if (!result.success) {
        throw new UnauthorizedException('Token inválido');
      }

      const userInfo = await this.getUserInfo(result.payload.sub);

      if (!userInfo) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      if (!userInfo.isActive) {
        throw new UnauthorizedException('Usuario inactivo');
      }

      request.user = userInfo;

      this.logger.debug(
        `Usuario autenticado: ${userInfo.email} - Rol: ${userInfo.role.code}`,
      );

      return true;
    } catch (error) {
      this.logger.error('Error en autenticación:', error.message);

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' && typeof token === 'string' ? token : undefined;
  }

  private async getUserInfo(userId: string): Promise<AuthUser | null> {
    try {
      const result = await firstValueFrom(
        this.authClient.send(
          { cmd: 'user.findUserWithRoleById' },
          { id: userId },
        ),
      );

      if (!result) {
        return null;
      }

      return {
        id: result.id,
        email: result.email,
        isActive: result.isActive,
        role: {
          id: result.role.id,
          code: result.role.code,
          name: result.role.name,
        },
        personalInfo: result.personalInfo
          ? {
              firstName: result.personalInfo.firstName,
              lastName: result.personalInfo.lastName,
            }
          : undefined,
      };
    } catch (error) {
      this.logger.error('Error obteniendo información del usuario:', error);
      return null;
    }
  }
}
