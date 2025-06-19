import { BaseEntity } from '@modules/shared/base/base.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { NextFunction } from 'express';

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
export class Comment extends BaseEntity {
	constructor(comment: {
		content: string;
		picture_id: string;
		user_id: string;
	}) {
		super();
		this.content = comment?.content;
		this.picture_id = comment?.picture_id;
		this.user_id = comment?.user_id;
	}

	@Prop({ required: true })
	content: string;

	@Prop({ required: true })
	picture_id: string;

	@Prop({ required: true })
	user_id: string;
}

export const CommnetSchema = SchemaFactory.createForClass(Comment);

export const CommentSchemaFactory = () => {
	const Commnet_chema = CommnetSchema;

	Commnet_chema.pre('findOneAndDelete', async function (next: NextFunction) {
		// OTHER USEFUL METHOD: getOptions, getPopulatedPaths, getQuery = getFilter, getUpdate
		const Comment = await this.model.findOne(this.getFilter());
		await Promise.all([]);
		return next();
	});
	return Commnet_chema;
};
