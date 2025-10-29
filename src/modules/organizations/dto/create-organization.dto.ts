import { IsMongoId, IsNotEmpty, IsObject, IsOptional, MaxLength, IsString, IsEmail } from "class-validator";

export class CreateOrganizationDto {

    @IsNotEmpty({ message: 'Tên trường không được để trống' })
    name: string;

    @IsMongoId({ message: 'Id tỉnh thành không hợp lệ' })
    @IsNotEmpty({ message: 'Id tỉnh thành không được để trống' })
    province_id: string

    @IsNotEmpty({message: 'Slug không được bỏ trống'})
    slug: string

    @IsOptional()
    @IsString()
    principal_name?: string;

    @IsOptional()
    @IsString()
    principal_phone?: string;

    @IsOptional()
    @IsEmail({}, { message: 'Email hiệu trưởng không hợp lệ' })
    principal_email?: string;

    @IsOptional()
    @IsString()
    vice_principal_name?: string;

    @IsOptional()
    @IsString()
    vice_principal_phone?: string;

    @IsOptional()
    @IsEmail({}, { message: 'Email hiệu phó không hợp lệ' })
    vice_principal_email?: string;
}
