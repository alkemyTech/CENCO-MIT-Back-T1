import { IsDateString, IsEmail, IsOptional, IsString, IsStrongPassword, MaxLength, MinLength } from 'class-validator';
import { IsAdult, IsPhoneValid, IsNameValid, IsCountryValid } from 'src/validators';

export class UpdateUserByUserDto {

    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    @IsNameValid()
    name?: string;

    @IsOptional()
    @IsString()
    @IsStrongPassword()
    password?: string;

    @IsOptional()
    @IsString()
    @IsPhoneValid()
    phone?: string;

    @IsOptional()
    @IsString()
    @IsCountryValid()
    country?: string;

    @IsOptional()
    @IsDateString()
    @IsAdult()
    birthday?: string;
}
