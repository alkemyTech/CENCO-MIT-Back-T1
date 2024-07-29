import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const originalSend = response.send;

    response.send = function (body) {
      let message = 'No response message';
      if (typeof body === 'object') {
        message = body.errors
          ? JSON.stringify(body.errors)
          : body.message || message;
      } else if (typeof body === 'string') {
        try {
          const parsedBody = JSON.parse(body);
          message = parsedBody.errors
            ? JSON.stringify(parsedBody.errors)
            : parsedBody.message || message;
        } catch {
          message = body;
        }
      }
      response.locals.message = message;
      return originalSend.call(this, body);
    };

    return next.handle().pipe(
      tap({
        error: (err) => {
          if (err instanceof HttpException) {
            const status = err.getStatus();
            const errorResponse = err.getResponse();
            response.locals.error = {
              statusCode: status,
              message:
                typeof errorResponse === 'object'
                  ? JSON.stringify(errorResponse)
                  : errorResponse,
            };
          }
        },
      }),
    );
  }
}
