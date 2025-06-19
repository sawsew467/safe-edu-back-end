import { IsNotEmpty } from "class-validator";

export class CreateOtpDto {
        @IsNotEmpty({message: 'Sđt không được để trống'})
        phone_number: string;
      
        @IsNotEmpty({message: 'otp không được để trống'})
        otp: string;
    
}
