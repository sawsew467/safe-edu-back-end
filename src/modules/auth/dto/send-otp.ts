import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class SendOTPDto {
    @ApiProperty({
            description: 'Sđt người dùng',
          })
    @IsNotEmpty({ message: 'sđt không được để trống!!'})
    phone_number: string;
}