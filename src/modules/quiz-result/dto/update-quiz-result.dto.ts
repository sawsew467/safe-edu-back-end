import { PartialType } from '@nestjs/mapped-types';
import { CreateQuizResultDto } from './create-quiz-result.dto';

export class UpdateQuizResultDto extends PartialType(CreateQuizResultDto) {}
