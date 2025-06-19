import { forwardRef, Module } from '@nestjs/common';
import { PictureService } from './picture.service';
import { PictureController } from './picture.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Picture, PictureSchemaFactory } from './entities/picture.entity';
import { QuizModule } from '@modules/quiz/quiz.module';
import { QuizResultModule } from '@modules/quiz-result/quiz-result.module';
import { StudentsModule } from '@modules/students/students.module';
import { CitizensModule } from '@modules/citizens/citizens.module';

@Module({
	imports: [
		MongooseModule.forFeatureAsync([
			{
				name: Picture.name,
				useFactory: PictureSchemaFactory,
				inject: [],
				imports: [MongooseModule.forFeature([])],
			},
		]),
		QuizModule,
		forwardRef(() => QuizResultModule),
		StudentsModule,
		CitizensModule,
	],
	controllers: [PictureController],
	providers: [PictureService],
	exports: [PictureService, MongooseModule],
})
export class PictureModule {}
