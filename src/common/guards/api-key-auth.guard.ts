import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { envs } from '../../config/envs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyAuthGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      this.logger.debug('Ruta pública - saltando autenticación API Key');
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const apiKey = this.extractApiKeyFromHeader(request);

    if (!apiKey) {
      throw new UnauthorizedException('API Key requerida');
    }

    if (apiKey !== envs.API_KEY) {
      throw new UnauthorizedException('API Key inválida');
    }

    this.logger.debug('API Key válida - acceso autorizado');
    return true;
  }

  private extractApiKeyFromHeader(request: any): string | undefined {
    return request.headers['x-api-key'] || request.headers['api-key'];
  }
}
