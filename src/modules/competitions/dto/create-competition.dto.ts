import { IsEnum, IsNotEmpty, IsOptional, MaxLength } from "class-validator";

export class CreateCompetitionDto {
    @IsNotEmpty({message: 'Tên cuộc thi không được để trống'})
    title: string;

    @IsNotEmpty({message: 'Mô tả cuộc thi không được bỏ trống'})
    description: string;

    @IsNotEmpty({message: 'Trường này là bắt buộc'})
    startDate: Date;

    @IsNotEmpty({message: 'Trường này là bắt buộc'})
    endDate: Date;

    @IsOptional()
    image_url: string;

    @IsNotEmpty({message: "Mã định danh không được để trống"})
    slug: string;

    @IsOptional()
    isPublic: string;
}
