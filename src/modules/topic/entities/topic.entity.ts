import { BaseEntity } from '@modules/shared/base/base.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model } from 'mongoose';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { NextFunction } from 'express';

export type TopicDocument = HydratedDocument<Topic>;

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
export class Topic extends BaseEntity {
  save() {
    throw new Error('Method not implemented.');
  }
	constructor(topic: {
		topic_name?: string;
		description?: string;
		view: number;

	}) {
		super();
		this.topic_name = topic?.topic_name;
		this.description = topic?.description;
		this.view = topic?.view;
	}

	@Prop({
		required: true,
		minlength: 2,
		maxlength: 60,
		set: (topic_name: string) => {
			return topic_name.trim();
		},
	})
	topic_name: string;

	@Prop()
	description: string;

	@Prop({
		type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
	})
	categories: mongoose.Schema.Types.ObjectId[];

	@Prop({
		default: 0,
	})
	view: number;
}

export const TopicSchema = SchemaFactory.createForClass(Topic);

export const TopicSchemaFactory = () => {
	const topic_schema = TopicSchema;

	topic_schema.pre('findOneAndDelete', async function (next: NextFunction) {
		const topic = await this.model.findOne(this.getFilter());
		await Promise.all([]);
		return next();
	});

	return topic_schema;
};