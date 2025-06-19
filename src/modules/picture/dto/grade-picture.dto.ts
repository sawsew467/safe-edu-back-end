import { IsNotEmpty, IsOptional } from 'class-validator';

export class GradePictureDto {
	@IsNotEmpty({ message: 'phần thì không được để trống' })
	quiz_result_id: string;

	@IsNotEmpty({ message: 'Điểm không được để trống' })
	grade: number;

	@IsOptional()
	feedback: string;
}
