import { Controller, Get, Post, Body, Patch, Param, Delete, UnauthorizedException, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto } from './dto/login-user.dto';
import { Role } from './entities/role.enum';
import { Roles } from 'src/decorators/has-roles.decorator';
import { RolesGuard } from 'src/guards/role.guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post('signup')
  async create(@Body() createUserDto: CreateUserDto): Promise<{ message: string }> {
    await this.userService.create(createUserDto);
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

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Roles(Role.ADMIN)
  @UseGuards(
    JwtAuthGuard,
    RolesGuard
  )
  @Patch(':rut')
  update(@Param('rut') rut: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(rut, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
