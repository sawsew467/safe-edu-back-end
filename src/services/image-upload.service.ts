import { Injectable } from '@nestjs/common';
import { AwsS3Service } from 'src/services/aws-s3.service';
import { IFile } from 'src/interfaces/file.interface';

@Injectable()
export class ImageUploadService {
  constructor(private readonly awsS3Service: AwsS3Service) {}

  async uploadImage(image: IFile): Promise<string> {
    if (!image) {
      throw new Error('File is required');
    }
    return this.awsS3Service.uploadImage(image);
  }
}
