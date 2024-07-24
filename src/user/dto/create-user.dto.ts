import { IsString, IsEmail, IsNotEmpty, IsOptional, IsEnum, MinLength, MaxLength, IsDateString } from 'class-validator';
import { IsStrongPassword, IsAdult } from '../../validators';
import { Role } from '../entities/role.enum';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

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
  @IsEnum(Role)
  role?: Role;
}
