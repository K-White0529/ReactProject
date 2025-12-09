// express-rate-limitの型定義エラーを回避
declare module 'express-rate-limit' {
  import { RequestHandler, Request, Response, NextFunction } from 'express';
  
  export interface RateLimitInfo {
    limit: number;
    current: number;
    remaining: number;
    resetTime?: Date;
  }
  
  export interface RateLimitRequestHandler extends RequestHandler {
    resetKey: (key: string) => void;
  }
  
  export interface Options {
    windowMs?: number;
    max?: number | ((req: Request, res: Response) => number | Promise<number>);
    message?: string;
    statusCode?: number;
    legacyHeaders?: boolean;
    standardHeaders?: boolean;
    requestPropertyName?: string;
    skipFailedRequests?: boolean;
    skipSuccessfulRequests?: boolean;
    keyGenerator?: (req: Request, res: Response) => string;
    handler?: (req: Request, res: Response) => void;
    onLimitReached?: (req: Request, res: Response, options?: Options) => void;
    skip?: (req: Request, res: Response) => boolean | Promise<boolean>;
    requestWasSuccessful?: (req: Request, res: Response) => boolean;
    validate?: boolean;
    store?: any;
  }
  
  function rateLimit(options?: Options): RateLimitRequestHandler;
  
  export default rateLimit;
}
