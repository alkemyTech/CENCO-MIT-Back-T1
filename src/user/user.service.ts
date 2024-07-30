import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, UseGuards, HttpException, HttpStatus, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Role } from './entities/role.enum';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RolesGuard } from 'src/guards/role.guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Roles } from 'src/decorators/has-roles.decorator';
import { th } from 'date-fns/locale';
import { SearchUserDto } from './dto/seach-user.dto';


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
    return this.userRepository.findOne({ where: { id, isDeleted: false } });
  }
  async findByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({
      where: { email, isDeleted: false },
      select: ['id', 'email', 'name', 'phone', 'country', 'birthday', 'role'],

    });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      where: { isDeleted: false },
      select: ['id', 'email', 'name', 'phone', 'country', 'birthday', 'role', 'isDeleted', 'deletedDate'],
    });
  }

  async softRemove(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'email', 'name', 'phone', 'country', 'birthday', 'role', 'isDeleted', 'deletedDate']
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.isDeleted = true;
    user.deletedDate = new Date();
    return await this.userRepository.save(user);
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

    if (name) {
      existingUser.name = name;
    }

    if (email) {
      existingUser.email = email;
    }

    try {
      await this.userRepository.save(existingUser);
      return {
        statusCode: HttpStatus.OK,
        message: 'User updated successfully',
        data: {
          //If name or email is in the body, we show it in the data
          ...(name ? { name: name } : {}),
          ...(email ? { email: email } : {})
        }
      };
    } catch (error) {
      throw new InternalServerErrorException("Failed to update user");
    }

  }


  async delete(id: number) {
    try {
      const result = await this.userRepository.softDelete(id);
      if (result.affected === 0) {
        throw new NotFoundException("The user doesn't exist");
      }
      return { message: 'User deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) {

        throw error;
      } else {
        throw new InternalServerErrorException("Failed to delete user");
      }
    }
  }

  async searchUsers(searchUserDto: SearchUserDto): Promise<Partial<User>[]> {
    try {
      const { name, email, country } = searchUserDto;

      const queryOptions: any = {
        select: ['id', 'email', 'name', 'rut', 'phone', 'country', 'birthday', 'role', 'isDeleted'],
        where: {}
      };

      if (name) {
        queryOptions.where['name'] = Like(`%${name}%`);
      }
      if (email) {
        queryOptions.where['email'] = Like(`%${email}%`);
      }
      if (country) {
        queryOptions.where['country'] = Like(`%${country}%`);
      }

      const users = await this.userRepository.find(queryOptions);

      if (users.length <= 0) {
        return await this.findAll();
      }

      return users;
    } catch (error) {
      throw new BadRequestException('Error searching users');
    }
  }
}
