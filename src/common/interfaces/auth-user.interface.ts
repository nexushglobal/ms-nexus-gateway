export interface AuthUser {
  id: string;
  email: string;
  role: {
    id: string;
    code: string;
    name: string;
  };
  personalInfo?: {
    firstName: string;
    lastName: string;
  };
  isActive: boolean;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}
