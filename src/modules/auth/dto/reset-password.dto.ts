import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class ResetPasswordDto {
    @ApiProperty({ description: 'token người dùng' })
    @IsNotEmpty ({ message: 'token không được để trống!!' })
    otp: string;

    @ApiProperty({ description: 'mật khẩu mới' })
    @IsNotEmpty ({ message: 'mật khẩu mới không được để trống!!' })
    newPassword: string;
}
