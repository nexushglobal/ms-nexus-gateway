export interface BaseLogInfo {
  timestamp: string;
  method: string;
  url: string;
  userId: string;
  ip: string | undefined;
  userAgent: string;
}
