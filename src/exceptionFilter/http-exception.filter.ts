import { ExceptionFilter, Catch, ArgumentsHost, HttpException, BadRequestException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    console.error('Error Status:', status);
    console.error('Error Message:', exception.message);

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
    };

    if (exception instanceof BadRequestException) {
      const response = exception.getResponse();
      if (typeof response === 'object' && response.hasOwnProperty('message')) {
        errorResponse['errors'] = response['message'];
      }
    }

    response.status(status).json(errorResponse);
  }
}
