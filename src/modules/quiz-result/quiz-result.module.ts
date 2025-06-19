import { forwardRef, Module } from '@nestjs/common';
import { QuizResultService } from './quiz-result.service';
import { QuizResultController } from './quiz-result.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
	QuizResult,
	QuizResultSchemaFactory,
} from './entities/quiz-result.entity';
import { SubmissionModule } from '@modules/submission/submission.module';
import { QuestionsService } from '@modules/questions/questions.service';
import { QuestionsModule } from '@modules/questions/questions.module';
import { PictureModule } from '@modules/picture/picture.module';
import { QuizModule } from '@modules/quiz/quiz.module';
import { QuizResultRepository } from '@repositories/quiz-result_repository';
import { Student } from '@modules/students/entities/student.entity';
import { StudentsModule } from '@modules/students/students.module';
import { CompetitionsModule } from '@modules/competitions/competitions.module';
import { StudentsRepository } from '@repositories/student.repository';

import { CompetitionsRepository } from '@repositories/competition.repository';

@Module({
	imports: [
		MongooseModule.forFeatureAsync([{
			name: QuizResult.name,
			useFactory: QuizResultSchemaFactory,
			inject: [],
			imports: [MongooseModule.forFeature([])],
		},]),
		forwardRef(() => QuestionsModule),
		forwardRef(() => CompetitionsModule),
		forwardRef(() => StudentsModule),
		QuizModule,
		SubmissionModule,
	],
	controllers: [QuizResultController],
	providers: [QuizResultService, QuestionsService,
		{
			provide: 'QuizResultRepositoryInterface',
			useClass: QuizResultRepository,
		},
		{
			provide: 'StudentsRepositoryInterface',
			useClass: StudentsRepository,
		},
		{
			provide: 'CompetitionsRepositoryInterface',
			useClass: CompetitionsRepository,
		}

	],
	exports: ['QuizResultRepositoryInterface', QuizResultService, MongooseModule],
})
export class QuizResultModule { }
