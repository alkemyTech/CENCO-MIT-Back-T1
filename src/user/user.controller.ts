
import { Controller, Get, Post, Body, Patch, Param, Delete, UnauthorizedException, Req, BadRequestException, UsePipes, ValidationPipe, NotFoundException, Query, Res, HttpStatus, HttpCode } from '@nestjs/common';

import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto } from './dto/login-user.dto';
import { Request } from 'express';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/has-roles.decorator';
import { Role } from './entities/role.enum';
import { find } from 'rxjs';
import { GetUserDto } from './dto/get-user.dto';
import { User } from './entities/user.entity';

import { Not } from 'typeorm';

import { SearchUserDto } from './dto/seach-user.dto';
import { UpdateUserByUserDto } from './dto/update-user-by-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';


@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post('signup')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async create(@Body() createUserDto: CreateUserDto, @Req() req: Request): Promise<{ message: string }> {
    await this.userService.create(createUserDto, req.user);
    return { message: 'User successfully created' };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)  //httpStatus.ok to change the default 201 created status in method post
  // From the body we get the parameters of the login defined in the dto file
  async login(@Body() loginDto: LoginDto) {
    // returns the response from de service
    return this.userService.login(loginDto)
  }
  @Post('change-password')
  @UseGuards(JwtAuthGuard)  // Guard to ensure the user is authenticated
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req: Request,
  ): Promise<{ statusCode: number, message: string }> {
    const userId = req.user.sub;  

    const result = await this.userService.updatePassword(userId, changePasswordDto.currentPassword, changePasswordDto.newPassword);

    return {
      statusCode: result.statusCode,
      message: result.message,
    };
  }


  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: Request & { user: User }) {
    const userId = req.user.sub;
    if (!userId) {
      throw new NotFoundException('User ID not found in the request');
    }
    return this.userService.findUserById(userId);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAll(@Req() req: Request & { user: User }) {

    return this.userService.findAll();
  }

  @Roles(Role.ADMIN)
  @UseGuards(
    JwtAuthGuard,
    RolesGuard
  )
  @Patch('update')
  update(@Query('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @UseGuards(
    JwtAuthGuard,
    RolesGuard
  )
  @Patch('updateByUser')
  async updateByUser(@Req() req: Request & { user: User }, @Body() UpdateUserByUserDto: UpdateUserByUserDto) {
    const userId = req.user.sub;
    if (!userId) {
      throw new NotFoundException('User ID not found in the request');
    }
    return this.userService.updateByUser(userId, UpdateUserByUserDto);
  }

  @Delete('delete/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: number) {
    return await this.userService.delete(id);
  }

  @Roles(Role.ADMIN)
  @UseGuards(
    JwtAuthGuard,
    RolesGuard
  )
  @Get('search')
  async searchUsers(@Query() query: SearchUserDto) {
    const users = await this.userService.searchUsers(query);
    return {
      message: `Found ${users.length} users`,
      data: { users },
    };
  }
}
