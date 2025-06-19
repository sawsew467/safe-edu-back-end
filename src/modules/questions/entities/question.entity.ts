import { BaseEntity } from '@modules/shared/base/base.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { NextFunction } from 'express';
import { required } from 'joi';
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
export class Question extends BaseEntity {
	constructor(question: {
		question?: string;
		answer?: string[];
		correct_answer?: string;
		image?: string;
		time_limit?: number;
		point?: number;
		quiz_id: mongoose.Types.ObjectId;
	}) {
		super();
		this.question = question?.question;
		this.answer = question?.answer;
		this.correct_answer = question?.correct_answer;
		this.image = question?.image;
		this.time_limit = question?.time_limit;
		this.point = question?.point;
		this.quiz_id = question?.quiz_id;
	}

	@Prop({
		required: false,
	})
	question?: string;

	@Prop({
		required: false,
	})
	answer?: string[];

	@Prop({
		required: false,
	})
	correct_answer?: string;

	@Prop({
		required: false,
	})
	image?: string;

	@Prop({
		required: false,
		default: 30,
	})
	time_limit?: number;

	@Prop({
		required: false,
		default: 10,
	})
	point?: number;

	@Prop({
		type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }],
	})
	quiz_id: mongoose.Types.ObjectId;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);

export const QuestionSchemaFactory = () => {
	const questionSchema = QuestionSchema;
	questionSchema.pre('findOneAndDelete', async function (next: NextFunction) {
		const question = await this.model.findOne(this.getFilter());
		return next();
	});

	return questionSchema;
};
