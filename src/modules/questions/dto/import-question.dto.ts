import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ImportQuestionsDto {
	@ApiProperty({
		example: '60b8d295f5ee123456789abc',
		description: 'ID của Quiz',
	})
	@IsString()
	quizId: string;
}
