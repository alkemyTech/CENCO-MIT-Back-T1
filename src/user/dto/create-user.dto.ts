export class CreateUserDto {
    name: string;
    email: string;
    password: string;
    phone?: string;
    country?: string;
    birthday?: string;
    role: 'user' | 'admin';
  }
  