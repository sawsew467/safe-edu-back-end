import { StudentsRepository } from '@repositories/student.repository';
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// INNER

// OUTER
import { OrganizationsService } from '@modules/organizations/organizations.service';
import { OrganizationsRepository } from '@repositories/organizations.repository';
import { OrganizationsModule } from '@modules/organizations/organizations.module';
import { Student, StudentSchemaFactory } from './entities/student.entity';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';

import { AuthService } from '@modules/auth/auth.service';
import { CitizensModule } from '@modules/citizens/citizens.module';
import { CitizensService } from '@modules/citizens/citizens.service';
import { QuizResultModule } from '@modules/quiz-result/quiz-result.module';
import { QuizResultService } from '@modules/quiz-result/quiz-result.service';
import { SubmissionModule } from '@modules/submission/submission.module';
import { QuestionsModule } from '@modules/questions/questions.module';
import { ProvincesModule } from '@modules/provinces/provinces.module';
import { CompetitionsModule } from '@modules/competitions/competitions.module';

@Module({
	imports: [
		MongooseModule.forFeatureAsync([
			{
				name: Student.name,
				useFactory: StudentSchemaFactory,
				inject: [],
				imports: [MongooseModule.forFeature([])],
			},
		]),
		forwardRef(() => QuizResultModule),
		OrganizationsModule,
		CitizensModule,
		forwardRef(() => SubmissionModule),
		forwardRef(() => QuestionsModule),
		forwardRef(() => CompetitionsModule),
		ProvincesModule,
	],
	controllers: [StudentsController],
	providers: [
		StudentsService,
		{ provide: 'StudentsRepositoryInterface', useClass: StudentsRepository },
		CitizensService,
		QuizResultService,
	],
	exports: [StudentsService, 'StudentsRepositoryInterface', MongooseModule],
})
export class StudentsModule {}
