import { Transform } from 'class-transformer';
import {
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsPhoneNumber,
	IsStrongPassword,
	MaxLength,
} from 'class-validator';

export class CreateCitizenDto {
	@IsNotEmpty({ message: 'Tên người dân không được để trống' })
	@MaxLength(50)
	first_name: string;

	@IsNotEmpty({ message: 'Tên người dân không được để trống' })
	@MaxLength(50)
	last_name: string;

	@IsOptional()
	date_of_birth?: Date;

	@IsOptional()
	@IsPhoneNumber('VN', { message: 'Số điện thoại không thuộc vùng Việt Nam' })
	@Transform(({ value }) => formatPhoneNumber(value))
	phone_number?: string;

	@IsOptional()
	province: string;

	@IsOptional()
	@IsEmail({}, { message: 'Email không hợp lệ' })
	@MaxLength(50)
	email?: string;

	@IsOptional()
	avatar?: string;

	@IsNotEmpty({ message: 'username không được để trống' })
	@MaxLength(50)
	username: string;

	@IsNotEmpty({ message: 'Mật khẩu không được để trống' })
	@IsStrongPassword({
		minLength: 6,
		minUppercase: 1,
		minLowercase: 1,
		minNumbers: 1,
		minSymbols: 1,
	})
	password: string;
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
