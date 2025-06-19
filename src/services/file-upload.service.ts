import { Injectable } from '@nestjs/common';
import { AwsS3Service } from 'src/services/aws-s3.service';
import { IFile } from 'src/interfaces/file.interface';

@Injectable()
export class UploadFileService {
  constructor(private readonly awsS3Service: AwsS3Service) {}

  async uploadFile(file: IFile): Promise<string> {
    if (!file) {
      throw new Error('File is required');
    }
    return this.awsS3Service.uploadDocument(file);
  }


}
