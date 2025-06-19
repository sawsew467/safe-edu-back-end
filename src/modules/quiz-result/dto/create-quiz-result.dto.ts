import { IsNotEmpty } from 'class-validator';

export class CreateQuizResultDto {
	@IsNotEmpty({ message: 'tên câu hỏi không được để trống ' })
	quizId: string;
}
