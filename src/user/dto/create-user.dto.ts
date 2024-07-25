import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  MinLength,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { IsStrongPassword, IsAdult } from '../../validators';
import { Role } from '../entities/role.enum';
import { IsInEnum } from 'src/decorators/role-validator.decorator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsNotEmpty()
  rut: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @IsStrongPassword()
  password: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsDateString()
  @IsAdult()
  birthday?: string;

  @IsOptional()
  @IsInEnum(Role)
  role?: Role;
}
