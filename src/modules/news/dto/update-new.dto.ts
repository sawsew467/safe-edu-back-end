import { PartialType } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";
import { CreateNewDto } from "./create-new.dto";
import mongoose from "mongoose";

export class UpdateNewDto extends PartialType(CreateNewDto) {
    @IsOptional()
	title: string;

    @IsOptional()
    topic_id: string;

    @IsOptional()
	content: string;
    
    @IsOptional()
	image?: string;

    @IsOptional()
	author: string;
}
