import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './exceptionFilter/http-exception.filter';
import { UserService } from './user/user.service';
import { CreateUserDto } from './user/dto/create-user.dto';
import { Role } from './user/entities/role.enum';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth/auth.service';
import { CreateAuthDto } from './auth/dto/create-auth.dto';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:5173',
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

  const configService = app.get(ConfigService);
  const authService = app.get(AuthService);

  const userEmail = configService.get<string>('defaultAdmin.email');
  const existingUser = await authService.findByEmail(userEmail);

  if (!existingUser) {
    const userDTO: CreateAuthDto = {
      name: configService.get<string>('defaultAdmin.name'),
      rut: configService.get<string>('defaultAdmin.rut'),
      email: userEmail,
      password: configService.get<string>('defaultAdmin.password'),
      role: Role.ADMIN,
    };

    const admin = await authService.create(userDTO);
    console.log('Inserted admin:', admin);
  }

  await app.listen(3000);
}
bootstrap();
