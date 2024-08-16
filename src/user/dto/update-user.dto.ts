import { IsEmail, IsOptional, IsString, IsStrongPassword, MaxLength, MinLength } from 'class-validator';

export class UpdateUserDto {

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @MinLength(2)
    @MaxLength(50)
    @IsOptional()
    name?: string;

    @IsOptional()
    @IsString()
    @IsStrongPassword()
    password?: string;
}
