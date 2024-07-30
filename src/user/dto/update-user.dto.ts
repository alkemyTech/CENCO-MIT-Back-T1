import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateUserDto {

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @MinLength(2)
    @MaxLength(50)
    @IsOptional()
    name?: string;
}
