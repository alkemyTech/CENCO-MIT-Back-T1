import { ConflictException, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
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
    const userFoundByEmail = await this.userRepository.findOne({ where: { email } });

    if (!userFoundByEmail) {
      // if the email doesn't exists, throw a bad request exception
      throw new HttpException("The user doesn't exists", HttpStatus.BAD_REQUEST);
    }

    // Verify password
    const verifyPassword = await bcrypt.compare(password, userFoundByEmail.password);

    if (!verifyPassword) {
      // if the password doesn't match, throw a new error with a message of invalid credentials
      throw new Error("Invalid credentials");
    }

    // If everithing is ok, returns a token signed with the role and the jwt_secret defined in an .env file
    return this.jwtServ.sign({
      role: userFoundByEmail.role,
    }, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '1h',
    });
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
