import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { IsInEnum } from 'src/decorators/role-validator.decorator';
import { Role } from '../entities/role.enum';

export class UpdateUserDto {

    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    name?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsInEnum(Role)
    role?: Role;
}
