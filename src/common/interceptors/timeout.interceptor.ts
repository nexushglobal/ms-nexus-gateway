import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
  Logger,
} from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { envs } from '../../config/envs';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TimeoutInterceptor.name);

  constructor(
    private readonly timeoutValue: number = envs.REQUEST_TIMEOUT_MS || 30000,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;

    return next.handle().pipe(
      timeout(this.timeoutValue),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          this.logger.warn(
            `Request timeout: ${method} ${url} - ${this.timeoutValue}ms`,
          );

          return throwError(
            () =>
              new RequestTimeoutException({
                message: 'El servidor tardó demasiado en responder',
                timeout: this.timeoutValue,
                path: url,
                method: method,
              }),
          );
        }
        return throwError(() => err as unknown);
      }),
    );
  }
}
