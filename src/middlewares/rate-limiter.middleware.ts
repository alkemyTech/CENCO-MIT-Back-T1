import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RateLimiterMiddleware implements NestMiddleware {
  private limiters: Record<string, RateLimitRequestHandler>;

  constructor(private readonly configService: ConfigService) {
    this.limiters = {
      '/user/signup': rateLimit({
        windowMs: this.configService.get<number>('rateLimit.signup.windowMs'),
        max: this.configService.get<number>('rateLimit.signup.maxRequests'),
        message: 'Too many requests for signing up, please try again later.',
      }),
      '/user/login': rateLimit({
        windowMs: this.configService.get<number>('rateLimit.login.windowMs'),
        max: this.configService.get<number>('rateLimit.login.maxRequests'),
        message: 'Too many login attempts, please try again later.',
      }),
      'default': rateLimit({
        windowMs: this.configService.get<number>('rateLimit.general.windowMs'),
        max: this.configService.get<number>('rateLimit.general.maxRequests'),
        message: 'Too many requests, please try again later.',
      }),
    };
  }

  use(req: Request, res: Response, next: NextFunction): void {
    const url = req.originalUrl || req.url;
    console.log(`Applying rate limit for ${url}`);

    const limiter = this.limiters[url] || this.limiters['default'];
    limiter(req, res, next);
  }
}
