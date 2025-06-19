import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class VerifiedOtpDTO {
    @ApiProperty({ description: 'otp người dùng' })
    @IsNotEmpty ({ message: 'otp không được để trống!!' })
    otp: string;

    @ApiProperty({ description: 'email người dùng' })
    @IsNotEmpty ({ message: 'email không được để trống!!' })
    email: string
}
