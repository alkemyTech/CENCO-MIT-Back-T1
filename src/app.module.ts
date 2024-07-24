import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DATABASE, HOST, PASSWORD, PORT, USERNAME } from 'config/config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: HOST,
      port: PORT,
      username: USERNAME,
      password: PASSWORD,
      database: DATABASE,
      entities: [],
      synchronize: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
