import { Transform } from 'class-transformer';
import { IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class SignInDto {
	@IsNotEmpty({ message: 'Tên đăng nhập không được để trống' })
	username: string;
	@IsNotEmpty({ message: 'Mật khẩu không được để trống' })
	password: string;
}
