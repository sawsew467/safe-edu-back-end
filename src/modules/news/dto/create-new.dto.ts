import { IsNotEmpty, IsOptional } from "class-validator";
import mongoose from "mongoose";

export class CreateNewDto {
	@IsNotEmpty({message: "Chủ đề không được bỏ trống"})
	topic_id: string;
  
    @IsNotEmpty({message: "Tiêu đề không được bỏ trống"})
	title: string;

    @IsNotEmpty({message: "Nội dung không được bỏ trống"})
	content: string;
    
	@IsOptional()
	image: string;

    @IsNotEmpty({message: "Tác giả không được bỏ trống"})
	author: string;

}
