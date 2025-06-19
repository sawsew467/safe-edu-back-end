import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSubmissionDto {
	@IsNotEmpty({ message: 'Id câu hỏi không được để trống ' })
	question_id: string;

	@IsOptional()
	answer: string;
}
