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
export class Submission extends BaseEntity {
	constructor(submission: {
		user_id: mongoose.Types.ObjectId;
		question_id: mongoose.Types.ObjectId;
		answer?: string;
		isCorrect: boolean;
		score: number;
		quiz_id: mongoose.Types.ObjectId;
	}) {
		super();
		this.user_id = submission.user_id;
		this.question_id = submission.question_id;
		this.isCorrect = submission.isCorrect;
		this.answer = submission?.answer;
		this.score = submission?.score;
		this.quiz_id = submission?.quiz_id;
	}

	@Prop({
		type: mongoose.Schema.Types.ObjectId,
		required: true,
	})
	user_id: mongoose.Types.ObjectId;

	@Prop({
		type: mongoose.Schema.Types.ObjectId,
		required: true,
	})
	quiz_id: mongoose.Types.ObjectId;

	@Prop({
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Question',
		required: true,
	})
	question_id: mongoose.Types.ObjectId;

	@Prop()
	answer: string;

	@Prop({
		required: true,
	})
	isCorrect: boolean;

	@Prop()
	score: number;
}

export const SubmissionSchema = SchemaFactory.createForClass(Submission);

export const SubmissionSchemaFactory = () => {
	const submissionSchema = SubmissionSchema;
	submissionSchema.pre('findOneAndDelete', async function (next: NextFunction) {
		const question = await this.model.findOne(this.getFilter());
		return next();
	});

	return submissionSchema;
};
