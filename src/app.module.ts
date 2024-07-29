import { Module, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from 'config/config';
import { databaseConfig } from './database/database';
import { RateLimiterMiddleware } from './middlewares/rate-limiter.middleware';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './winston/wiston-config';
import { LoggingMiddleware } from './middlewares/logging.middleware';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from './interceptors/response.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    WinstonModule.forRoot(winstonConfig),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) =>
        databaseConfig(configService),
      inject: [ConfigService],
    }),
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    const middlewares = [RateLimiterMiddleware, LoggingMiddleware];

    consumer.apply(...middlewares).forRoutes('*'); // Apply middlewares to all routes
  }
}
