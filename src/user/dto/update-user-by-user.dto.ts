import { IsDateString, IsEmail, IsOptional, IsString, IsStrongPassword, MaxLength, MinLength } from 'class-validator';
import { IsAdult } from 'src/validators';

export class UpdateUserByUserDto {

    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    name?: string;

    @IsOptional()
    @IsString()
    @IsStrongPassword()
    password?: string;

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
}
