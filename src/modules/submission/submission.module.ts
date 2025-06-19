import { Module } from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { SubmissionController } from './submission.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
	Submission,
	SubmissionSchemaFactory,
} from './entities/submission.entity';
import { QuestionsModule } from '@modules/questions/questions.module';

@Module({
	imports: [
		MongooseModule.forFeatureAsync([
			{
				name: Submission.name,
				useFactory: SubmissionSchemaFactory,
				inject: [],
				imports: [MongooseModule.forFeature([])],
			},
		]),
		QuestionsModule,
	],
	controllers: [SubmissionController],
	providers: [SubmissionService],
	exports: [MongooseModule],
})
export class SubmissionModule {}
