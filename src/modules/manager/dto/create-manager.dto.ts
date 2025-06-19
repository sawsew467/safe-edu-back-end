import { Organization } from '../../organizations/entities/organization.entity';
import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsEmail,
  MaxLength,
} from 'class-validator';

export class CreateManagerDto {
  @IsNotEmpty()
  @MaxLength(50)
  first_name: string;

  @IsNotEmpty()
  @MaxLength(50)
  last_name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  imageUrl?: string;

  @IsNotEmpty({ message: 'Số điện thoại không được để trống'})
  @IsPhoneNumber('VN', { message: 'Số điện thoại không thuộc Việt Nam' })
  @Transform(({ value }) => formatPhoneNumber(value)) 
  phone_number: string;

  @IsOptional()
	organizationId: string[];
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
