import { IsNotEmpty } from 'class-validator';

export class CreateCommnetDto {
	@IsNotEmpty({ message: 'id picture không được để trống' })
	picture_id: string;

	@IsNotEmpty({ message: 'Nội dung không được để trống' })
	content: string;
}
