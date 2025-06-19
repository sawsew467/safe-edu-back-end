import { Module } from '@nestjs/common';
import { CommnetService } from './comment.service';
import { CommnetController } from './comment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentSchemaFactory } from './entities/commnet.entity';
import { PictureModule } from '@modules/picture/picture.module';
import { Comment } from '@modules/comment/entities/commnet.entity';
import { StudentsModule } from '@modules/students/students.module';
import { CitizensModule } from '@modules/citizens/citizens.module';
@Module({
	imports: [
		MongooseModule.forFeatureAsync([
			{
				name: Comment.name,
				useFactory: CommentSchemaFactory,
				inject: [],
				imports: [MongooseModule.forFeature([])],
			},
		]),
		PictureModule,
		StudentsModule,
		CitizensModule,
	],
	controllers: [CommnetController],
	providers: [CommnetService],
})
export class CommnetModule {}
