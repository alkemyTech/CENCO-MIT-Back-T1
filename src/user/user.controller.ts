import { Controller, Get, Post, Body, Patch, Param, Delete, Req,NotFoundException, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request } from 'express';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/has-roles.decorator';
import { Role } from './entities/role.enum';
import { User } from './entities/user.entity';
import { SearchUserDto } from './dto/seach-user.dto';


@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }


  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: Request & { user: User }) {
    const user = await this.userService.findByEmail(req.body.email);
    if (user == undefined) {
      throw new NotFoundException ('User was not found');
    }
    return user;
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
    return this.userService.update(rut, updateUserDto);
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
