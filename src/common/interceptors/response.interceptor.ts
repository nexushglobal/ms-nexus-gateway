import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';
import { createBaseLogInfo } from '../helpers/create-base-log-info.helper';

interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  message: string | string[];
  errors: string | string[] | null;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  private readonly logger = new Logger(ResponseInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    return next.handle().pipe(
      map((data) => {
        const statusCode = response.statusCode;
        const message = this.getSuccessMessage(context, statusCode);
        // Log de respuesta exitosa
        this.logSuccessResponse(request, statusCode, message, data);

        return {
          success: true,
          data: data,
          message: message,
          errors: null,
        };
      }),
    );
  }

  private getSuccessMessage(
    context: ExecutionContext,
    statusCode: number,
  ): string {
    const method = context.switchToHttp().getRequest<Request>().method;
    const route = context.switchToHttp().getRequest<Request>().route?.path;

    // Mensajes personalizados por método HTTP
    switch (method) {
      case 'GET':
        return this.getGetMessage(route, statusCode);
      case 'POST':
        return this.getPostMessage(route, statusCode);
      case 'PUT':
      case 'PATCH':
        return this.getPutMessage(route, statusCode);
      case 'DELETE':
        return this.getDeleteMessage(route, statusCode);
      default:
        return 'Operación completada exitosamente';
    }
  }

  private getGetMessage(route: string, statusCode: number): string {
    if (statusCode === 200) {
      if (route?.includes('/:id')) {
        return 'Registro obtenido exitosamente';
      }
      return 'Datos obtenidos exitosamente';
    }
    return 'Consulta realizada exitosamente';
  }

  private getPostMessage(route: string, statusCode: number): string {
    if (statusCode === 201) {
      return 'Recurso creado exitosamente';
    }
    if (statusCode === 200) {
      return 'Operación realizada exitosamente';
    }
    return 'Proceso completado exitosamente';
  }

  private getPutMessage(route: string, statusCode: number): string {
    if (statusCode === 200) {
      return 'Registro actualizado exitosamente';
    }
    if (statusCode === 204) {
      return 'Actualización completada';
    }
    return 'Modificación realizada exitosamente';
  }

  private getDeleteMessage(route: string, statusCode: number): string {
    if (statusCode === 200) {
      return 'Registro eliminado exitosamente';
    }
    if (statusCode === 204) {
      return 'Eliminación completada';
    }
    return 'Recurso eliminado exitosamente';
  }

  private logSuccessResponse(
    request: Request,
    statusCode: number,
    message: string,
    data: any,
  ) {
    const baseInfo = createBaseLogInfo(request);
    this.logger.log({
      ...baseInfo,
      level: 'SUCCESS',
      type: 'HTTP_SUCCESS',
      response: {
        statusCode,
        message,
        hasData: data !== null && data !== undefined,
        dataType: Array.isArray(data) ? 'array' : typeof data,
        dataLength: Array.isArray(data) ? data.length : undefined,
      },
    });
  }
}
