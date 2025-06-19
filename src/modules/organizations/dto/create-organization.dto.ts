import { IsMongoId, IsNotEmpty, IsObject, IsOptional, MaxLength } from "class-validator";

export class CreateOrganizationDto {

    @IsNotEmpty({ message: 'Tên trường không được để trống' })
    name: string;

    @IsMongoId({ message: 'Id tỉnh thành không hợp lệ' })
    @IsNotEmpty({ message: 'Id tỉnh thành không được để trống' })
    province_id: string

    @IsNotEmpty({message: 'Slug không được bỏ trống'})
    slug: string
}
