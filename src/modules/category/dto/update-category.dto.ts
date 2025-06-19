import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';
import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @IsOptional()
  category_name: string;
  
  @IsOptional()
  topic_id: string;
  
  @IsOptional()
  description?: string;

  @IsOptional()
  image?:  string
}
