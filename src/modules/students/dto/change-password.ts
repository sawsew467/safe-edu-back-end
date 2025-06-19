import { IsNotEmpty, IsStrongPassword } from 'class-validator';

export class ChangePasswordDTO {
	@IsNotEmpty({ message: 'Mật khẩu không được để trống' })
	@IsStrongPassword({
		minLength: 6,
		minUppercase: 1,
		minLowercase: 1,
		minNumbers: 1,
		minSymbols: 1,
	})
	old_password: string;
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
