import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateUserDto {

    @IsEmail()
    email?: string;

    @IsString()
    @MinLength(2)
    @MaxLength(50)
    name?: string;
}
