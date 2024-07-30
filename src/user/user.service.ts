import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, UseGuards, HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Role } from './entities/role.enum';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RolesGuard } from 'src/guards/role.guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Roles } from 'src/decorators/has-roles.decorator';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly jwtServ: JwtService,
    private readonly configService: ConfigService
  ) { }

  async findUserById(id: number): Promise<User | undefined> {
    if (id <= 0) {
      throw new Error('The ID must be a positive number.');
    }
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        select: ['id', 'email', 'name', 'phone', 'country', 'birthday', 'role']
      });
      if (!user) {

        return undefined;
      }
      return user;
    } catch (error) {
      console.error('Error fetching the user.:', error);
      throw new Error('Error fetching the user.');
    }
  }
  async MyProfile(id: number): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { id } });
  }
  async findByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'name', 'phone', 'country', 'birthday', 'role'],
    });
  }
  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: ['id', 'email', 'name', 'phone', 'country', 'birthday', 'role'],
    });

  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async update(rut: string, updateUserDto: UpdateUserDto) {

    const { name, email } = updateUserDto;

    const existingUser = await this.userRepository.findOne({ where: { rut: rut } })

    if (!existingUser) {
      throw new NotFoundException("The user doesn't exist");
    }

    existingUser.name = name;
    existingUser.email = email;

    try {
      return this.userRepository.save(existingUser);
    } catch (error) {
      throw new InternalServerErrorException("Failed to update user");
    }

  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }




}
