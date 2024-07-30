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
  import { IsStrongPassword, IsAdult, IsRutFormat } from '../../validators';
  import { IsInEnum } from 'src/decorators/role-validator.decorator';
import { Role } from 'src/user/entities/role.enum';
  
  export class CreateAuthDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    name: string;
  
    @IsNotEmpty()
    @IsRutFormat()
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
  