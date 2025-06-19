import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class VerifiedOTPDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Sđt không được để trống'})
    phone_number: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'OTP không được để trống'})
    otp: string;
}