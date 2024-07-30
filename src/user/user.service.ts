import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, UseGuards, HttpException, HttpStatus, UnauthorizedException, BadRequestException } from '@nestjs/common';
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

  // Checks if a user with the given email or RUT already exists and if so throws an exception.
  private async checkIfUserExists(email: string, rut: string): Promise<void> {
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { rut }]
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

    const { password, email, name, rut, phone, country, birthday, role } = createUserDto;

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
    const existingUser = await this.userRepository.findOne({ where: { email } });

    if (!existingUser) {
      // if the email doesn't exists, throw a bad request exception
      throw new NotFoundException("The user doesn't exist");
    }

    // Verify password
    const verifyPassword = await bcrypt.compare(password, existingUser.password);

    if (!verifyPassword) {
      // if the password doesn't match, throw a new error with a message of invalid credentials
      throw new UnauthorizedException("Invalid credentials");
    }

    const token = this.jwtServ.sign({
      sub: existingUser.id, // ID del usuario
      role: existingUser.role
    }, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '1h'
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Login successful',
      data: token
      
    };
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

  remove(id: number) {
    return `This action removes a #${id} user`;
  }




}
