import { IsNotEmpty, IsOptional } from "class-validator";

export class SignInTokenDto {
    @IsNotEmpty()
    token: string;

    @IsOptional()
    avatar?: string;
}