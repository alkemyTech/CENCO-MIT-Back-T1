import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Request, Response, NextFunction } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger, // Inyectar el logger de Winston
  ) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl } = req; // Obtener el método y la URL original de la petición
    const start = Date.now(); // Marcar el tiempo de inicio

    res.on('finish', () => {
      const { statusCode, statusMessage } = res; // Obtener el código de estado de la respuesta
      const duration = Date.now() - start; // Calcular la duración de la petición

      // Formatear la marca de tiempo
      const timestamp = format(new Date(), 'dd-MM-yyyy, p', { locale: es });

      // Obtener el mensaje de respuesta y de error desde response.locals
      const responseMessage = res.locals.message || 'No response message';

      // Definir colores personalizados
      const colors = {
        message: '\x1b[32m', // Verde
        status: '\x1b[34m', // Azul
        took: '\x1b[36m', // Cian
        request: '\x1b[33m', // Amarillo
        reset: '\x1b[0m', // Restablecer color
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
