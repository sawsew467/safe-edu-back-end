import { DocumentFilesRepository } from 'src/repositories/document.repository';


import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentFilesController } from './document.controller';
import { DocumentFilesService } from './document.service';
import { AwsS3Service } from 'src/services/aws-s3.service';
import { GeneratorService } from 'src/services/generator.service';
import { UploadFileService } from 'src/services/file-upload.service';
import { DocumentFile, DocumentFileSchemaFactory } from './entities/document.entity';


@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: DocumentFile.name,
        useFactory: DocumentFileSchemaFactory,
      },
    ]),
  ],
  controllers: [DocumentFilesController],
  providers: [
    DocumentFilesService,
    AwsS3Service,
    GeneratorService,
    UploadFileService,
    { provide: 'DocumentRepositoryInterface', useClass: DocumentFilesRepository },
  ],
  exports: [AwsS3Service],
})
export class DocumentModule {}
