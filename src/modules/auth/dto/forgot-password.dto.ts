import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class ForgotPasswordDto {
    @ApiProperty({
        description: 'Email người dùng',
    })
    @IsNotEmpty({ message: 'Email không được để trống!!'})
    email: string;
}
