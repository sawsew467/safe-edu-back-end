import { forwardRef, Module } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Question, QuestionSchemaFactory } from './entities/question.entity';
import { QuizResultService } from '@modules/quiz-result/quiz-result.service';
import { QuizResultModule } from '@modules/quiz-result/quiz-result.module';
import { CompetitionsModule } from '@modules/competitions/competitions.module';
import { QuizModule } from '@modules/quiz/quiz.module';
import { QuizService } from '@modules/quiz/quiz.service';
import { SubmissionModule } from '@modules/submission/submission.module';
import { Quiz } from '@modules/quiz/entities/quiz.entity';
import { AwsS3Service } from 'src/services/aws-s3.service';
import { ConfigService } from '@nestjs/config';
import { GeneratorService } from 'src/services/generator.service';
import { Student } from '@modules/students/entities/student.entity';
import { StudentsModule } from '@modules/students/students.module';

@Module({
	imports: [
		MongooseModule.forFeatureAsync([
			{
				name: Question.name,
				useFactory: QuestionSchemaFactory,
				inject: [],
				imports: [MongooseModule.forFeature([])],
			},
		]),
		forwardRef(() => QuizResultModule),
		forwardRef(() => StudentsModule),
		QuizModule,
	],
	controllers: [QuestionsController],
	providers: [
		QuestionsService,
		AwsS3Service,
		GeneratorService,
		
	],
	exports: [QuestionsService, MongooseModule, AwsS3Service],
})
export class QuestionsModule {}
