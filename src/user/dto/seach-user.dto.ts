import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.enum';
import { IsInEnum } from 'src/decorators/role-validator.decorator';
import { IsRutFormat } from 'src/validators';

export class SearchUserDto {

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    country?: string;

    @IsString()
    @MinLength(2)
    @MaxLength(50)
    @IsOptional()
    name?: string;

    @IsString()
    @IsInEnum(Role)
    @IsOptional()
    role?: Role;

    @IsString()
    @IsRutFormat()
    @IsOptional()
    rut?: string;

}
