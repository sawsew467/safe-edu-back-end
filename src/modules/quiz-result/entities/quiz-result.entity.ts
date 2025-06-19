import { BaseEntity } from '@modules/shared/base/base.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { NextFunction } from 'express';
import mongoose from 'mongoose';

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
export class QuizResult extends BaseEntity {
	constructor(submission: {
		user_id: mongoose.Types.ObjectId;
		quiz_id: mongoose.Types.ObjectId;
		completedAt: Date;
		startAt: Date;
		score: number;
		feedback: string;
	}) {
		super();
		this.user_id = submission.user_id;
		this.quiz_id = submission.quiz_id;
		this.completedAt = submission.completedAt;
		this.score = submission.score;
		this.startAt = submission.startAt;
		this.feedback = submission?.feedback;
	}
	@Prop({
		type: mongoose.Schema.Types.ObjectId,
		required: true,
	})
	user_id: mongoose.Types.ObjectId;

	@Prop({
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Quiz',
		required: true,
	})
	quiz_id: mongoose.Types.ObjectId;

	@Prop()
	score: number;

	@Prop()
	completedAt: Date;

	@Prop()
	feedback: string;

	@Prop()
	startAt: Date;
}

export const QuizResultSchema = SchemaFactory.createForClass(QuizResult);

export const QuizResultSchemaFactory = () => {
	const quizResultSchema = QuizResultSchema;
	quizResultSchema.pre('findOneAndDelete', async function (next: NextFunction) {
		const question = await this.model.findOne(this.getFilter());
		return next();
	});

	return quizResultSchema;
};
