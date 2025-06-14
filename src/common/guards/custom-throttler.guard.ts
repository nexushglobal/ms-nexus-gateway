import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { ThrottlerException, ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  private readonly logger = new Logger(CustomThrottlerGuard.name);
  // eslint-disable-next-line @typescript-eslint/require-await
  protected async getTracker(req: Record<string, any>): Promise<string> {
    if (req.user?.id) {
      return `user-${req.user.id}`;
    }

    const userAgent = req.headers['user-agent'] || 'unknown';
    const userAgentHash = this.hashString(userAgent);
    return `${req.ip}-${userAgentHash}`;
  }

  protected generateKey(
    context: ExecutionContext,
    tracker: string,
    throttler: string,
  ): string {
    const request = context.switchToHttp().getRequest();
    const route = request.route?.path || request.url;
    const method = request.method;

    return `${throttler}-${tracker}-${route}-${method}`;
  }
  // eslint-disable-next-line @typescript-eslint/require-await
  protected async throwThrottlingException(
    context: ExecutionContext,
  ): Promise<void> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    response.header('X-RateLimit-Limit', '100');
    response.header('X-RateLimit-Remaining', '0');
    response.header(
      'X-RateLimit-Reset',
      new Date(Date.now() + 60000).toISOString(),
    );

    this.logger.warn(
      `Rate limit exceeded for ${request.ip} on ${request.method} ${request.url}`,
    );

    throw new ThrottlerException('Too Many Requests - Rate limit exceeded');
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString();
  }
}
