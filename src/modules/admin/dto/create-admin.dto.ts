import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsEmail,
  IsString,
  IsStrongPassword,
  MaxLength,
  IsDefined,
  Matches,
} from 'class-validator';

export class CreateAdminDto {
  @IsNotEmpty({ message: 'First name is required' })
  @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
  first_name: string;

  @IsNotEmpty({ message: 'Last name is required' })
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
  last_name: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @IsOptional()
  imageUrl?: string;

  @IsOptional()
  @IsPhoneNumber('VN', { message: 'Invalid phone number format for Vietnam' })
  @Transform(({ value }) => formatPhoneNumber(value))
  phone_number?: string;
}

function formatPhoneNumber(phone: string): string {
  if (!phone) return phone;
  if (phone.startsWith('+84')) {
    return phone;
  }
  if (phone.startsWith('0')) {
    return `+84${phone.slice(1)}`;
  }
  return phone;
}