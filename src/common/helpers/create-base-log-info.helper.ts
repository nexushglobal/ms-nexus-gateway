import { Request } from 'express';
import { BaseLogInfo } from '../interfaces/base-log-info.interface';

export function createBaseLogInfo(request: Request): BaseLogInfo {
  return {
    timestamp: new Date().toISOString(),
    method: request.method,
    url: request.url,
    userId: 'anonymous',
    ip: request.ip,
    userAgent: (request.get('user-agent') || '').substring(0, 100),
  };
}
