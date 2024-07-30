import { Column, DeleteDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from './role.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  rut: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @Column({ nullable: true })
  phone?: string;

  @Column({ type: 'date', nullable: true })
  birthday?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ default: false })
  isDeleted: boolean;

  @DeleteDateColumn()
  deletedDate?: Date;
}
