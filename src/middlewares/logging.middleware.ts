import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Request, Response, NextFunction } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl } = req;
    const start = Date.now();

    res.on('finish', () => {
      const { statusCode, statusMessage } = res;
      const duration = Date.now() - start; // Calculate request duration

      // Format time
      const timestamp = format(new Date(), 'dd-MM-yyyy, p', { locale: es });

      // Obtain response and error message from response.locals
      const responseMessage = res.locals.message || 'No response message';

      // Define personalize colors
      const colors = {
        message: '\x1b[32m',
        status: '\x1b[34m',
        took: '\x1b[36m',
        request: '\x1b[33m',
        reset: '\x1b[0m',
      };

      // Mensaje de log con la información de la petición y respuesta
      const logMessage = `\n${colors.request}Request: ${method} ${originalUrl} \n${colors.reset}Time: ${timestamp} \n${colors.took}Took: ${duration}ms \n${colors.status}HTTP status: ${statusCode} ${statusMessage} \n${colors.message}Response message: ${responseMessage}\n${colors.reset}`;

      // Asignar el nivel del log según el código de estado de la respuesta
      if (statusCode >= 500) {
        this.logger.error(logMessage);
      } else if (statusCode >= 400) {
        this.logger.warn(logMessage);
        // console.log(errorMessage);
      } else {
        this.logger.info(logMessage);
      }
    });

    next(); // Pasar al siguiente middleware o controlador
  }
}
