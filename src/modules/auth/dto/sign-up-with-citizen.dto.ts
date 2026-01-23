import { Transform } from 'class-transformer';
import {
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsPhoneNumber,
	IsStrongPassword,
	Matches,
	MaxLength,
} from 'class-validator';
import { formatPhoneNumber } from './sign-up-with-student.dto';

export class SignUpWithCitizenDto {
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

	@IsNotEmpty({ message: 'username không được để trống' })
	@MaxLength(50)
	@Matches(/^[\w-]+$/, {
		message:
			'username chỉ được chứa chữ số hoặc dấu - và không có khoảng trắng',
	})
	username: string;

	@IsNotEmpty({ message: 'Mật khẩu không được để trống' })
	@IsStrongPassword({
		minLength: 8,
		minLowercase: 0,
		minUppercase: 0,
		minNumbers: 0,
		minSymbols: 0,
	})
	password: string;
}
