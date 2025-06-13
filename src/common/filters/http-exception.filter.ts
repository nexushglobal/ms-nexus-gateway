import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Response } from 'express';
import { ApiError, ApiResponse } from '../interfaces/api-response.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status: number;
    let message: string;
    let errors: ApiError[] | null = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const errorResponse = exceptionResponse as any;

        if (Array.isArray(errorResponse.message)) {
          message = 'Error en la validación de datos';
          errors = this.formatValidationErrors(errorResponse.message);
        } else if (
          errorResponse.message &&
          Array.isArray(errorResponse.errors)
        ) {
          message = errorResponse.message;
          errors = this.formatValidationErrors(errorResponse.errors);
        } else {
          message = errorResponse.message || exception.message;
        }
      } else {
        message = exception.message;
      }
    } else if (this.isRpcException(exception)) {
      const rpcError = exception as any;

      if (rpcError.error) {
        status = rpcError.error.status || HttpStatus.INTERNAL_SERVER_ERROR;
        message = rpcError.error.message || 'Error interno del servidor';

        if (rpcError.error.errors) {
          errors = Array.isArray(rpcError.error.errors)
            ? rpcError.error.errors
            : [{ code: 'MICROSERVICE_ERROR', message: rpcError.error.errors }];
        }
      } else if (rpcError.status && rpcError.message) {
        status = rpcError.status;
        message = rpcError.message;
      } else if (rpcError.response && typeof rpcError.response === 'object') {
        status = rpcError.response.status || HttpStatus.INTERNAL_SERVER_ERROR;
        message = rpcError.response.message || 'Error interno del servidor';
      } else {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = rpcError.message || 'Error interno del servidor';
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Error interno del servidor';
      this.logger.error('Unhandled exception:', exception);
    }

    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
    );

    const errorResponse: ApiResponse<null> = {
      success: false,
      data: null,
      message,
      errors,
    };

    response.status(status).json(errorResponse);
  }

  private isRpcException(exception: unknown): boolean {
    return (
      exception instanceof RpcException ||
      (typeof exception === 'object' &&
        exception !== null &&
        ('error' in exception ||
          ('status' in exception && 'message' in exception) ||
          'response' in exception))
    );
  }

  private formatValidationErrors(validationErrors: string[]): ApiError[] {
    return validationErrors.map((error) => {
      let field: string | undefined;

      const patterns = [
        /^(\w+)\s+must\s+/i, // "email must be valid"
        /^(\w+)\s+should\s+/i, // "email should be valid"
        /^(\w+)\s+es\s+requerido/i, // "email es requerido"
        /^El\s+(\w+)\s+/i, // "El email debe..."
        /^La\s+(\w+)\s+/i, // "La contraseña debe..."
      ];

      for (const pattern of patterns) {
        const match = error.match(pattern);
        if (match) {
          field = match[1];
          break;
        }
      }

      if (!field) {
        if (
          error.toLowerCase().includes('correo') ||
          error.toLowerCase().includes('email')
        ) {
          field = 'email';
        } else if (
          error.toLowerCase().includes('contraseña') ||
          error.toLowerCase().includes('password')
        ) {
          field = 'password';
        } else if (error.toLowerCase().includes('nombre')) {
          field = 'firstName';
        } else if (error.toLowerCase().includes('apellido')) {
          field = 'lastName';
        } else if (
          error.toLowerCase().includes('teléfono') ||
          error.toLowerCase().includes('celular')
        ) {
          field = 'phone';
        } else if (error.toLowerCase().includes('fecha')) {
          field = 'birthDate';
        } else if (error.toLowerCase().includes('género')) {
          field = 'gender';
        } else if (error.toLowerCase().includes('país')) {
          field = 'country';
        }
      }

      return {
        field,
        code: 'VALIDATION_ERROR',
        message: error,
      };
    });
  }
}
