import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UnauthorizedException, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/role.guard';
import { Role } from 'src/user/entities/role.enum';
import { Roles } from 'src/decorators/has-roles.decorator';
import { LoginDto } from './dto/login-user.dto';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }


  @Post('signup')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async create(@Body() createUserDto: CreateAuthDto, @Req() req: Request): Promise<{ message: string }> {
    await this.authService.create(createUserDto, req.user);
    return { message: 'User successfully created' };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)  //httpStatus.ok to change the default 201 created status in method post
  // From the body we get the parameters of the login defined in the dto file
  async login(@Body() loginDto: LoginDto) {
    // returns the response from de service
    return this.authService.login(loginDto)
  }

  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
