import { IsString, IsEmail, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { Role } from '../../types/role';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  password?: string;
}

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsEnum(Role)
  role: Role;

  @IsString()
  password: string;

  @IsBoolean()
  @IsOptional()
  mustChangePassword?: boolean;
}
