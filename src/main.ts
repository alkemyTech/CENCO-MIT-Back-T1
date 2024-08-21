import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './exceptionFilter/http-exception.filter';
import { UserService } from './user/user.service';
import { CreateUserDto } from './user/dto/create-user.dto';
import { Role } from './user/entities/role.enum';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get<string>('cors.origin'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        return new BadRequestException(
          errors.map((error) => ({
            field: error.property,
            errors: Object.values(error.constraints),
          })),
        );
      },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const userService = app.get(UserService);
  

  const userEmail = configService.get<string>('defaultAdmin.email');
  const existingUser = await userService.findByEmail(userEmail);

  if (!existingUser) {
    const userDTO: CreateUserDto = {
      name: configService.get<string>('defaultAdmin.name'),
      rut: configService.get<string>('defaultAdmin.rut'),
      email: userEmail,
      password: configService.get<string>('defaultAdmin.password'),
      role: Role.ADMIN,
    };

    const admin = await userService.create(userDTO);
    console.log('Inserted admin:', admin);
  }

  await app.listen(3000);
}
bootstrap();
