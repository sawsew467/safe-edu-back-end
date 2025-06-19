import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TopicsService } from './topic.service';
import { TopicsController } from './topic.controller';
import { Topic, TopicSchemaFactory } from './entities/topic.entity';
import { TopicsRepository } from 'src/repositories/topic.repository';
import { AwsS3Service } from 'src/services/aws-s3.service';
import { GeneratorService } from 'src/services/generator.service';
import { ImageUploadService } from 'src/services/image-upload.service';



@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Topic.name,
        useFactory: TopicSchemaFactory,
        inject:[],
        imports: [MongooseModule.forFeature([])],
      },
    ]),
     // Import UserRolesModule để sử dụng UserRolesService và UserRolesRepositoryInterface
  ],
  controllers: [TopicsController],
  providers: [
    TopicsService,
    AwsS3Service,
    GeneratorService,
    ImageUploadService,
    { provide: 'TopicsRepositoryInterface', useClass: TopicsRepository },
  ],
  exports: [
    TopicsService,
    'TopicsRepositoryInterface',
  ],

})
export class TopicsModule {}
