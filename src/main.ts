import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { UserService } from './user/user.service';
import { CreateUserDto } from './user/dto/create-user.dto';
import { Role } from './user/entities/role.enum';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const userService = app.get(UserService);

  // COMMENT THIS
  const userDTO: CreateUserDto = {
    name: 'Admin',
    rut: '11.111.111-1',
    email: 'admin@admin.cl',
    password: 'Admin',
    role: Role.ADMIN,
  };
  const user = await userService.create(userDTO);
  console.log('Inserted user:', user);
  console.log('YOU MUST COMMENT THIS LINES IN main.ts');

  await app.listen(3000);
}
bootstrap();
