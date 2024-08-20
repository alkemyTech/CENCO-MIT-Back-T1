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
import { IsStrongPassword, IsAdult, IsRutFormat, IsPhoneValid } from '../../validators';
import { Role } from '../entities/role.enum';
import { IsInEnum } from 'src/decorators/role-validator.decorator';

export class CreateUserDto {
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

  @IsNotEmpty()
  @IsString()
  @IsPhoneValid()
  phone?: string;

  @IsNotEmpty() 
  @IsString()
  country?: string;

  @IsNotEmpty() 
  @IsDateString()
  @IsAdult()
  birthday?: string;

  @IsOptional()
  @IsInEnum(Role)
  role?: Role;
}
