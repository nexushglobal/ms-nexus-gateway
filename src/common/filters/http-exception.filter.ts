import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Request, Response } from 'express';
import { RpcError } from '../interfaces/rpc-error.interface';
import { createBaseLogInfo } from '../helpers/create-base-log-info.helper';

@Catch()
export class RpcCustomExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(RpcCustomExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Valores por defecto
    let status = 500;
    let message: string | string[] = 'Error interno del servidor';
    let errors: string[] | null = null;
    let serviceInfo = 'ms-nexus-gateway';
    let errorType = 'UNKNOWN';

    if (exception instanceof RpcException) {
      const rpcError = exception.getError() as RpcError;
      errorType = 'RPC_ERROR';

      if (rpcError && typeof rpcError === 'object' && rpcError.service)
        serviceInfo = rpcError.service;

      // Caso 1: Error estructurado según RpcError
      if (this.isRpcError(rpcError)) {
        status = rpcError.status || status;
        message = Array.isArray(rpcError.message)
          ? rpcError.message
          : [rpcError.message || message[0]];
        errors = rpcError.errors
          ? Array.isArray(rpcError.errors)
            ? rpcError.errors
            : [rpcError.errors]
          : null;
      }
      // Caso 2: Error de base de datos propagado desde microservicio
      else if (typeof rpcError === 'object' && 'errno' in rpcError) {
        errorType = 'DATABASE_ERROR';
        const errorResponse = this.handleDatabaseError(rpcError);
        status = errorResponse.status;
        message = 'Error de base de datos';
        errors = [errorResponse.message];
      }
      // Caso 3: Error no estructurado
      else {
        message = [typeof rpcError === 'string' ? rpcError : message[0]];
        errors =
          typeof rpcError === 'object' ? [JSON.stringify(rpcError)] : null;
      }
    } else if (exception instanceof HttpException) {
      errorType = 'HTTP_ERROR';
      const responseError = exception.getResponse();
      status = exception.getStatus();

      if (typeof responseError === 'object' && responseError !== null) {
        // Caso especial para errores de validación de class-validator
        if (Array.isArray(responseError['message'])) {
          message = 'Errores de validación';
          errors = responseError['message'];
        } else if (typeof responseError['message'] === 'string') {
          // Determinar mensaje por status code
          if (status === 401) {
            message = 'Error de autenticación';
          } else if (status === 403) {
            message = 'Error de autorización';
          } else if (status === 404) {
            message = 'Recurso no encontrado';
          } else if (status >= 500) {
            message = 'Error interno del servidor';
          } else {
            message = 'Error en la solicitud';
          }
          errors = [responseError['message']];
        } else {
          message = 'Error en la solicitud';
          errors = [exception.message];
        }
      } else {
        message = 'Error en la solicitud';
        errors = [String(responseError)];
      }
    } else {
      // Para cualquier otro tipo de error que no sea RpcException o HttpException
      errorType = 'GENERIC_ERROR';

      // Verificar si es un objeto con estructura de RpcError
      if (typeof exception === 'object' && exception !== null) {
        const errorObj = exception as any;

        // Si tiene status, message y service, es probablemente un error de microservicio
        if (errorObj.status && errorObj.message && errorObj.service) {
          errorType = 'RPC_ERROR';
          status = errorObj.status;
          serviceInfo = errorObj.service;

          // Determinar el tipo de error por el status
          if (status === 400) {
            message = 'Errores de validación';
          } else if (status === 401) {
            message = 'Error de autenticación';
          } else if (status === 403) {
            message = 'Error de autorización';
          } else if (status === 404) {
            message = 'Recurso no encontrado';
          } else if (status >= 500) {
            message = 'Error interno del servidor';
          } else {
            message = 'Error en la solicitud';
          }

          // Los errores específicos van en errors
          errors = Array.isArray(errorObj.message)
            ? errorObj.message
            : [errorObj.message];
        }
        // Si es un Error nativo
        else if (errorObj.message) {
          message = 'Error interno del servidor';
          errors = [errorObj.message];
        }
        // Objeto desconocido
        else {
          message = 'Error desconocido';
          errors = [JSON.stringify(exception)];
        }
      } else if (exception instanceof Error) {
        message = 'Error interno del servidor';
        errors = [exception.message || 'Error desconocido'];
      } else {
        message = 'Error desconocido';
        errors = [String(exception)];
      }
    }

    const baseInfo = createBaseLogInfo(request);
    this.logger.error({
      ...baseInfo,
      level: 'ERROR',
      type: errorType,
      service: serviceInfo,
      error: {
        status,
        message,
        errors,
        // stack: exception.stack?.split('\n').slice(0, 5),
      },
    });

    response.status(status).json({
      success: false,
      data: null,
      message,
      errors,
    });
  }

  private isRpcError(error: any): error is RpcError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      'message' in error
    );
  }

  private handleDatabaseError(error: any): {
    status: number;
    message: string;
  } {
    const { errno, sqlMessage = '', code } = error;
    let status = 500;
    let message = 'Error interno de base de datos';

    if (errno === 1062) {
      status = 400;
      const match = String(sqlMessage).match(/Duplicate entry '(.+?)'/);
      const duplicateValue = match ? match[1] : 'valor duplicado';
      message = `El valor ingresado '${duplicateValue}' ya se encuentra registrado`;
    } else if (errno === 1364) {
      status = 400;
      message = `Campo requerido faltante: ${sqlMessage}`;
    } else if (errno === 1054 || code === 'ER_BAD_FIELD_ERROR') {
      status = 400;
      message = `Error en la consulta SQL: ${sqlMessage}`;
    } else if (errno === 1146 || code === 'ER_NO_SUCH_TABLE') {
      status = 400;
      message = `Tabla no encontrada: ${sqlMessage}`;
    } else {
      message = sqlMessage || `Error code: ${errno || code}`;
    }

    return { status, message };
  }
}
