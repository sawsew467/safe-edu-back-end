import { IsArray, IsEmail, IsMongoId, IsNotEmpty, IsOptional, MaxLength } from "class-validator";
import mongoose from "mongoose";

export class CreateSupervisorDto {
    @IsNotEmpty({ message: 'Tên không được để trống' })
    first_name: string;

    @IsNotEmpty({ message: 'Tên không được để trống' })
    last_name: string;

    @IsNotEmpty({ message: 'Email không được để trống' })
    @IsEmail({}, { message: 'Email không hợp lệ' })
    email: string;

    @IsNotEmpty({message: 'Tên trường không được để trống'})
    @IsArray({message: 'Danh sách trường là một mảng'})
    @IsMongoId({ each: true, message: 'Mỗi trường id phải là ObjectId hợp lệ' })
    province_ids: string[]

    @IsOptional()
    avatar_url?: string;
}
