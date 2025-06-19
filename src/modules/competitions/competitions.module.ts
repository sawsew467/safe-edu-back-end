import { forwardRef, Module } from '@nestjs/common';
import { CompetitionsService } from './competitions.service';
import { CompetitionsController } from './competitions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
	Competition,
	CompetitionSchemaFactory,
} from './entities/competition.entity';
import { CompetitionsRepository } from '@repositories/competition.repository';
import { QuizResultModule } from '@modules/quiz-result/quiz-result.module';
import { QuizModule } from '@modules/quiz/quiz.module';
import { StudentsModule } from '@modules/students/students.module';
import { CitizensModule } from '@modules/citizens/citizens.module';
import { OrganizationsModule } from '@modules/organizations/organizations.module';

@Module({
	imports: [
		MongooseModule.forFeatureAsync([
			{
				name: Competition.name,
				useFactory: CompetitionSchemaFactory,
				inject: [],
				imports: [MongooseModule.forFeature([])],
			},
		]),
		forwardRef(() => QuizResultModule),
		forwardRef(() => QuizModule),
		forwardRef(() => OrganizationsModule),
		forwardRef(() => StudentsModule),
		CitizensModule,
	
	],
	controllers: [CompetitionsController],
	providers: [
		CompetitionsService,
		{
			provide: 'CompetitionsRepositoryInterface',
			useClass: CompetitionsRepository,
		},
	],
	exports: [CompetitionsService, 'CompetitionsRepositoryInterface',MongooseModule],
})
export class CompetitionsModule {}
