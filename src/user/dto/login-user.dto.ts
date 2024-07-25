import { PickType } from "@nestjs/mapped-types";
import { User } from "../entities/user.entity";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

// The PickType only brings the necessary data for the login
export class LoginDto extends PickType(User, ['email','password']){

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

}