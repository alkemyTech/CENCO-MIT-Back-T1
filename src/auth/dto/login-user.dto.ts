import { PickType } from "@nestjs/mapped-types";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { User } from "src/user/entities/user.entity";

// The PickType only brings the necessary data for the login
export class LoginDto extends PickType(User, ['email','password']){

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

}