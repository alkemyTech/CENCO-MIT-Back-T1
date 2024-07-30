import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, UseGuards, HttpException,HttpStatus,UnauthorizedException} from '@nestjs/common';
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
import { RolesGuard } from 'src/guards/role.guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Roles } from 'src/decorators/has-roles.decorator';
import { th } from 'date-fns/locale';

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
        select: ['id', 'email', 'name', 'phone', 'country', 'birthday', 'role', 'isDeleted', 'deletedDate']});
    if (!user) {  
        throw new NotFoundException('User not found');
    }
    user.isDeleted = true;
    user.deletedDate = new Date();
    return await this.userRepository.save(user);
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

    // If everithing is ok, returns a token signed with the role and the jwt_secret defined in an .env file
    return this.jwtServ.sign({
      role: existingUser.role,
    }, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '1h',
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

  async remove(id: string) {
    try {
      const result = await this.userRepository.softDelete(id);
      if (result.affected === 0) {
        throw new NotFoundException("The user doesn't exist");
      }
      return { message: 'User deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        // Si el error ya es una excepción HTTP de NestJS, simplemente relánzalo
        throw error;
      } else {
        // Para cualquier otro tipo de error, registra el error y lanza una InternalServerErrorException
        console.error("Error deleting user:", error);
        throw new InternalServerErrorException("Failed to delete user");
      }
    }
  }
}
