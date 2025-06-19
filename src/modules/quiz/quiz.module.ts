import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Quiz, QuizSchemaFactory } from './entities/quiz.entity';
import { SubmissionService } from '@modules/submission/submission.service';

@Module({
	imports: [
		MongooseModule.forFeatureAsync([
			{
				name: Quiz.name,
				useFactory: QuizSchemaFactory,
				inject: [],
				imports: [MongooseModule.forFeature([])],
			},
		]),
	],
	controllers: [QuizController],
	providers: [QuizService],
	exports: [QuizService, MongooseModule],
})
export class QuizModule {}
