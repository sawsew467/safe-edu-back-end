import { IsNotEmpty, IsOptional } from 'class-validator';
import mongoose from 'mongoose';

export class CreateQuestionDto {
	@IsOptional({ message: 'Câu hỏi không được để trống' })
	question: string;

	@IsOptional({ message: 'Lựa chọn cho câu hỏi không được để trống' })
	answer?: string[];

	@IsOptional({ message: 'Câu trả lời không được để trống' })
	correct_answer?: string;

	@IsOptional()
	image?: string;

	@IsOptional()
	time_limit?: number;

	@IsOptional()
	point?: number;

	@IsNotEmpty({ message: 'loại câu hỏi không được để trống' })
	quiz_id: string;
}
