import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  HttpException,
  HttpStatus,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Role } from './entities/role.enum';
import { LoginDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SearchUserDto } from './dto/seach-user.dto';
import { UpdateUserByUserDto } from './dto/update-user-by-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly jwtServ: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async findUserById(id: number): Promise<User | undefined> {
    if (id <= 0) {
      throw new Error('The ID must be a positive number.');
    }
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        select: [
          'id',
          'email',
          'name',
          'phone',
          'country',
          'birthday',
          'role',
          'rut',
        ],
        withDeleted: true,
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
    return this.userRepository.findOne({ where: { id, deletedDate: null } });
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({
      where: { email, deletedDate: null },
      select: ['id', 'email', 'name', 'phone', 'country', 'birthday', 'role'],
      withDeleted: true,
    });
  }
  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: [
        'id',
        'email',
        'name',
        'phone',
        'rut',
        'country',
        'birthday',
        'role',
        'deletedDate',
        'createDate',
      ],
      withDeleted: true,
    });
  }

  async softRemove(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: [
        'id',
        'email',
        'name',
        'phone',
        'country',
        'birthday',
        'role',
        'deletedDate',
        'createDate',
      ],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.deletedDate = new Date();
    return await this.userRepository.save(user);
  }

  // Checks if a user with the given email or RUT already exists and if so throws an exception.
  private async checkIfUserExists(email: string, rut: string): Promise<void> {
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { rut }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictException('Email is already registered');
      }
      if (existingUser.rut === rut) {
        throw new ConflictException('RUT is already registered');
      }
    }
  }

  // Hash the provided password using bcrypt
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  // Create a new user, only if the creator is an admin, ensuring unique email and RUT, and hashing the password
  async create(createUserDto: CreateUserDto, creator?: User): Promise<User> {
    if (creator && creator.role !== Role.ADMIN) {
      throw new UnauthorizedException('Only admins can create new users');
    }

    const { password, email, name, rut, phone, country, birthday, role } =
      createUserDto;

    await this.checkIfUserExists(email, rut);

    const hashedPassword = await this.hashPassword(password);

    const user = this.userRepository.create({
      name,
      rut,
      email,
      password: hashedPassword,
      phone,
      country,
      birthday,
      role: role || Role.USER,
    });

    return this.userRepository.save(user);
  }

  async login(loginDto: LoginDto) {
    const { password, email } = loginDto;
    // Verify email
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (!existingUser) {
      // if the email doesn't exists, throw a bad request exception
      throw new NotFoundException("The user doesn't exist");
    }

    // Verify password
    const verifyPassword = await bcrypt.compare(
      password,
      existingUser.password,
    );

    if (!verifyPassword) {
      // if the password doesn't match, throw a new error with a message of invalid credentials
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtServ.sign(
      {
        sub: existingUser.id, // ID del usuario
        role: existingUser.role,
      },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '1h',
      },
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Login successful',
      data: token,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const existingUser = await this.userRepository.findOne({
      where: { id: id },
    });

    if (!existingUser) {
      throw new NotFoundException("The user doesn't exist");
    }

    // store the original data to compare the new info with the old ones to show the message
    const originalData = { ...existingUser };

    for (const key of Object.keys(updateUserDto)) {
      if (key in existingUser) {
        existingUser[key] = updateUserDto[key];
      }
    }

    try {
      await this.userRepository.save(existingUser);

      // To return de new data en response, but if the new data is a password we don't show it in the response
      const updatedData = Object.keys(updateUserDto).reduce(
        (acc, key) => {
          if (updateUserDto[key] !== originalData[key]) {
            acc[`new ${key}`] = updateUserDto[key];
          }
          return acc;
        },
        {} as Record<string, any>,
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'User updated successfully',
        data: updatedData,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async updateByUser(id: number, updateUserByUserDto: UpdateUserByUserDto) {
    const existingUser = await this.userRepository.findOne({
      where: { id: id },
    });

    if (!existingUser) {
      throw new NotFoundException("The user doesn't exist");
    }

    // store the original data to compare the new info with the old ones to show the message
    const originalData = { ...existingUser };

    for (const key of Object.keys(updateUserByUserDto)) {
      if (key === 'password') {
        const hashedPassword = await this.hashPassword(
          updateUserByUserDto[key],
        );
        existingUser.password = hashedPassword;
      } else if (key in existingUser) {
        existingUser[key] = updateUserByUserDto[key];
      }
    }

    try {
      await this.userRepository.save(existingUser);

      // To return de new data en response, but if the new data is a password we don't show it in the response
      const updatedData = Object.keys(updateUserByUserDto).reduce(
        (acc, key) => {
          if (
            updateUserByUserDto[key] !== originalData[key] &&
            key !== 'password'
          ) {
            acc[`new ${key}`] = updateUserByUserDto[key];
          }
          return acc;
        },
        {} as Record<string, any>,
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'User updated successfully',
        data: updatedData,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async delete(id: number) {
    try {
      const user = await this.userRepository.findOneBy({ id });

      if (!user) {
        throw new NotFoundException("The user doesn't exist");
      }

      if (user.deletedDate) {
        throw new ConflictException('The user has already been deleted');
      }

      const result = await this.userRepository.softDelete(id);
      if (result.affected === 0) {
        throw new NotFoundException("The user doesn't exist");
      }
      return { message: 'User deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new InternalServerErrorException('Failed to delete user');
      }
    }
  }
  async updatePassword(userId: number, currentPassword: string, newPassword: string): Promise<{ statusCode: number, message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException("The user doesn't exist");
    }

    // Verify the current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      // Return unauthorized response if passwords don't match
      return {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Password does not match',
      };
    }

    // Hash the new password and update it
    const hashedPassword = await this.hashPassword(newPassword);
    user.password = hashedPassword;

    try {
      await this.userRepository.save(user);
      return {
        statusCode: HttpStatus.OK,
        message: 'Password updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to update password');
    }
  }

  async searchUsers(searchUserDto: SearchUserDto): Promise<Partial<User>[]> {
    try {
      const { name, email, country, id } = searchUserDto;

      const queryOptions: any = {
        select: [
          'id',
          'email',
          'name',
          'rut',
          'phone',
          'country',
          'birthday',
          'role',
          'deletedDate',
          'createDate',
        ],
        where: {},
        withDeleted: true,
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
      if (id) {
        queryOptions.where['id'] = Like(`%${id}%`);
      }

      const users = await this.userRepository.find(queryOptions);

      if (users.length <= 0) {
        return [];
      }

      return users;
    } catch (error) {
      throw new BadRequestException('Error searching users');
    }
  }
}
