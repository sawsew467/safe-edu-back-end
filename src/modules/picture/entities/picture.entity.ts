import { ManagerSchema } from '@modules/manager/entities/manager.entity';
import { BaseEntity } from '@modules/shared/base/base.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { NextFunction } from 'express';
import mongoose from 'mongoose';

@Schema({
	timestamps: {
		createdAt: 'created_at',
	},
	toJSON: {
		getters: true,
		virtuals: true,
	},
})
export class Picture extends BaseEntity {
	constructor(picture: {
		picture: string;
		name: string;
		description: string;
		user_id: string;
		quiz_id: mongoose.Types.ObjectId;
		slug: string;
	}) {
		super();
		this.picture = picture?.picture;
		this.name = picture?.name;
		this.description = picture?.description;
		this.slug = picture.slug;
		this.user_id = picture?.user_id;
		this.quiz_id = picture?.quiz_id;
	}

	@Prop({ required: true })
	picture: string;

	@Prop({ required: true })
	name: string;

	@Prop({ required: true })
	slug: string;

	@Prop({ required: true })
	description: string;

	@Prop({ required: true })
	user_id: string;

	@Prop({
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Quiz',
	})
	quiz_id: mongoose.Types.ObjectId;
}

export const PictureShema = SchemaFactory.createForClass(Picture);

PictureShema.index({ user_id: 1, quiz_id: 1 }, { unique: true });

export const PictureSchemaFactory = () => {
	const picture_shema = PictureShema;
	picture_shema.pre('findOneAndDelete', async function (next: NextFunction) {
		const question = await this.model.findOne(this.getFilter());
		return next();
	});

	return picture_shema;
};
