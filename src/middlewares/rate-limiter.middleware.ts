import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RateLimiterMiddleware implements NestMiddleware {
  private limiter;

  constructor(private readonly configService: ConfigService) {
    // initializes the speed limiter with the setting of the environment variables
    this.limiter = rateLimit({
      windowMs: configService.get<number>('rateLimit.windowMs'),
      max: configService.get<number>('rateLimit.maxRequests'), 
      message: 'Too many requests from this IP, please try again later.',
    });
  }
// Middleware function to apply rate limiting to incoming requests
  use(req: Request, res: Response, next: NextFunction): void {
    this.limiter(req, res, next);
  }
}
