import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/user/entities/role.enum';
import { LoginDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private authRepository: Repository<User>,
    private readonly jwtServ: JwtService,
    private readonly configService: ConfigService
  ) { }

   // Checks if a user with the given email or RUT already exists and if so throws an exception.
 private async checkIfUserExists(email: string, rut: string): Promise<void> {
  const existingUser = await this.authRepository.findOne({ 
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
async create(createAuthDto: CreateAuthDto, creator?: User): Promise<User> {
  if (creator && creator.role !== Role.ADMIN) {
    throw new UnauthorizedException('Only admins can create new users');
  }

  const { password, email, name, rut, phone, country, birthday, role } = createAuthDto;

  await this.checkIfUserExists(email, rut);

  const hashedPassword = await this.hashPassword(password);

  const user = this.authRepository.create({
    name,
    rut,
    email,
    password: hashedPassword,
    phone,
    country,
    birthday,
    role: role || Role.USER,
  });

  return this.authRepository.save(user);
}

  async login(loginDto: LoginDto) {
    const { password, email } = loginDto;
    // Verify email
    const existingUser = await this.authRepository.findOne({ where: { email } });

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

    // If everithing is ok, returns a token signed with the role and the jwt_secret defined in an .env file
    return this.jwtServ.sign({
      role: existingUser.role,
    }, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '1h',
    });
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.authRepository.findOne({
      where: { email },
      select: ['id', 'email', 'name', 'phone', 'country', 'birthday', 'role'],
    });
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
