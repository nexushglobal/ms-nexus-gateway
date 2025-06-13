import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === 'object' && 'success' in data) {
          return data as ApiResponse<T>;
        }

        return {
          success: true,
          data: data,
          message: this.getSuccessMessage(context),
          errors: null,
        };
      }),
      catchError((error: unknown) => {
        return throwError(() => error);
      }),
    );
  }

  private getSuccessMessage(context: ExecutionContext): string {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;

    if (url.includes('/auth/login')) {
      return 'Inicio de sesión exitoso';
    }
    if (url.includes('/auth/refresh')) {
      return 'Token renovado exitosamente';
    }
    if (url.includes('/auth/verify')) {
      return 'Token verificado exitosamente';
    }
    if (url.includes('/users/register')) {
      return 'Usuario registrado exitosamente';
    }
    if (url.includes('/users') && method === 'GET') {
      return 'Usuarios obtenidos exitosamente';
    }
    if (url.includes('/integration/email')) {
      return 'Email enviado exitosamente';
    }
    if (url.includes('/integration/files/upload')) {
      return 'Archivo subido exitosamente';
    }
    if (url.includes('/integration/document/validate')) {
      return 'Documento validado exitosamente';
    }
    if (url.includes('/migration')) {
      return 'Migración completada exitosamente';
    }

    switch (method) {
      case 'GET':
        return 'Datos obtenidos exitosamente';
      case 'POST':
        return 'Recurso creado exitosamente';
      case 'PUT':
      case 'PATCH':
        return 'Recurso actualizado exitosamente';
      case 'DELETE':
        return 'Recurso eliminado exitosamente';
      default:
        return 'Operación completada exitosamente';
    }
  }
}
