import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './exceptionFilter/http-exception.filter';
import { UserService } from './user/user.service';
import { CreateUserDto } from './user/dto/create-user.dto';
import { Role } from './user/entities/role.enum';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        return new BadRequestException(
          errors.map(error => ({
            field: error.property,
            errors: Object.values(error.constraints),
          })),
        );
      },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const userService = app.get(UserService);
  const userEmail = 'admin@admin.cl';
  const existingUser = await userService.findByEmail(userEmail);

  if (!existingUser) {
    const userDTO: CreateUserDto = {
      name: 'Admin',
      rut: '11.111.111-1',
      email: userEmail,
      password: 'Admin',
      role: Role.ADMIN,
    };

    const admin = await userService.create(userDTO);
    console.log('Inserted admin:', admin);
  }

  await app.listen(3000);
}
bootstrap();
