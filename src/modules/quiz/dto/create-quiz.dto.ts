import { IsNotEmpty, IsOptional } from "class-validator";
import { QuizType } from "../entities/quiz.entity";

export class CreateQuizDto {
    @IsNotEmpty({ message: "Tiêu đề không được để trống"})
    title: string;

    @IsOptional()
    type?: QuizType;

    @IsNotEmpty({message: "Id cuộc thi là bắt buộc"})
    competitionId: string;
}
