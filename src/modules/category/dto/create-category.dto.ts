import { Category } from './../entities/category.entity';
import { IsNotEmpty, IsOptional, MaxLength } from "class-validator";

export class CreateCategoryDto {
  @IsNotEmpty()
  category_name: string;
  
  @IsNotEmpty()
  topic_id: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  image?:  string
}
