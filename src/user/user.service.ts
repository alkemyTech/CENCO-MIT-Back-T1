import { BadRequestException, ConflictException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Role } from './entities/role.enum';
import { LoginDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly jwtServ: JwtService,
    private readonly configService: ConfigService
  ) { }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { email } });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {

    const { password, email, name, rut, phone, country, birthday, role } =
      createUserDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

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
    const userFoundByEmail = await this.userRepository.findOne({ where: { email } });

    if (!userFoundByEmail) {
      // if the email doesn't exists, throw a bad request exception
      throw new NotFoundException("The user doesn't exists")
    }

    // Verify password
    const verifyPassword = await bcrypt.compare(password, userFoundByEmail.password);

    if (!verifyPassword) {
      // if the password doesn't match, throw a new error with a message of invalid credentials
      throw new Error("Invalid credentials");
    }

    // If everithing is ok, returns a token signed with the role and the jwt_secret defined in an .env file
    return this.jwtServ.sign(
      {
        role: userFoundByEmail.role,
      },
      {
        secret: this.configService.get<string>('JWT_SECRET')
      },
    );
  }


  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }


}
