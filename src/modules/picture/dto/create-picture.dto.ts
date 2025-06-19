import { IsNotEmpty } from 'class-validator';

export class CreatePictureDto {
	@IsNotEmpty({ message: 'Ảnh không được để trống' })
	picture: string;

	@IsNotEmpty({ message: 'Tên ảnh không được để trống' })
	name: string;

	@IsNotEmpty({ message: 'Mô tả không được để trống' })
	description: string;

	@IsNotEmpty({ message: 'phần thi không được để trống' })
	quiz_id: string;
}
