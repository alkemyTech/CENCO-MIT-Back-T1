import { Controller, Get, Post, Body, Patch, Param, Delete, UnauthorizedException, Req, BadRequestException, UsePipes, ValidationPipe, Query, Res, HttpStatus } from '@nestjs/common';
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
import { SearchUserDto } from './dto/seach-user.dto';

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
  // From the body we get the parameters of the login defined in the dto file
  async login(@Body() loginDto: LoginDto) {
    try {
      // returns the response from de service
      return this.userService.login(loginDto)
    } catch (error) {
      // throw an unauthorized exception
      throw new UnauthorizedException();
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: Request & { user: User }) {
    if (!req.user || !req.body.email) {
      throw new BadRequestException('Invalid user data.');
    }
    return this.userService.findByEmail(req.body.email);
  }


  @Get('profiles/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UsePipes(new ValidationPipe({ transform: true }))
  findOne(@Param() params: GetUserDto) {
    return this.userService.findUserById(params.id);
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
  update(@Query('rut') rut: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      return this.userService.update(rut, updateUserDto);
    } catch (error) {
      throw new BadRequestException("Error updating user")
    }
  }

  @Roles(Role.ADMIN)
  @UseGuards(
    JwtAuthGuard,
    RolesGuard
  )
  @Get('searchUsers')
  async searchUsers(@Query() query: SearchUserDto) {
    try {
      const users = await this.userService.searchUsers(query);
      return {
        message: `Found ${users.length} users`,
        data: { users },
      };
    } catch (error) {
      throw new BadRequestException('Error searching users');
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
