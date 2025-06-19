import { OmitType, PartialType } from '@nestjs/swagger';
import { IsOptional, MaxLength, IsBoolean, IsUrl } from 'class-validator';
import { CreateTopicDto } from './create-topic.dto';
import { IFile } from 'src/interfaces/file.interface';

export class UpdateTopicDto extends PartialType(
  OmitType(CreateTopicDto, ['topic_name'] as const), // You can add fields to omit as needed
) {
  @IsOptional()
  @MaxLength(60) 
  topic_name?: string;

  @IsOptional()
  @MaxLength(255) 
  description?: string;



  
}
