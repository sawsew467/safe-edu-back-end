import { IsNotEmpty, IsOptional, MaxLength, IsBoolean, IsUrl } from 'class-validator';
import { IFile } from 'src/interfaces/file.interface';

export class CreateTopicDto {
  @IsNotEmpty()
  @MaxLength(60) 
  topic_name: string;

  @IsOptional()
  @MaxLength(255) 
  description?: string;

}
