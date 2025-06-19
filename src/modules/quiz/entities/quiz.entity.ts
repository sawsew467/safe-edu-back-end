import { BaseEntity } from "@modules/shared/base/base.entity";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { NextFunction } from "express";
import mongoose from "mongoose";

export enum QuizType {
	MultipleChoice = "Phần thi lý thuyết",
  PaintingPropaganda = "Vẽ tranh cổ động",
  SocialThinking  = "Nghị luận xã hội",
  Practical = "Phần thi thực hành",  
}


@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  toJSON: {
    getters: true,
    virtuals: true,
  },
})
export class Quiz extends BaseEntity {
  constructor(quiz: {
    title: string;
    type?: QuizType;
    competitionId: mongoose.Types.ObjectId;
  }
  ){
    super()
    this.title = quiz?.title;
    this.type = quiz?.type;
    this.competitionId = quiz?.competitionId;
  }

  @Prop({
    required: true
  })
  title: string;

  @Prop({
    enum: QuizType,
    default: QuizType.MultipleChoice
  })
  type: QuizType;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Competition' }],
  })
  competitionId: mongoose.Types.ObjectId;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);

export const QuizSchemaFactory = () => {
  const quizSchema = QuizSchema;
  quizSchema.pre('findOneAndDelete', async function (next: NextFunction) {
    const question = await this.model.findOne(this.getFilter());
    return next();
  });

  return quizSchema;
};
