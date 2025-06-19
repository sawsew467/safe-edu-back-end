import { BaseEntity } from "@modules/shared/base/base.entity";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { NextFunction } from "express";
import mongoose, { HydratedDocument } from "mongoose";

export type NewsDocument = HydratedDocument<News>;

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

export class News extends BaseEntity {
	constructor(news: {
		title?: string;
		content?: string;
		image?: string;
		author?: string;
		topic_id?: mongoose.Types.ObjectId;
		view?: number
	}) {
		super();
		this.title = news?.title;
		this.content = news?.content;
		this.image = news?.image;
		this.author = news?.author;
		this.topic_id = news?.topic_id;
		this.view = news?.view;
	}

	@Prop({
			required: true,
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Topic',
		})
	topic_id: mongoose.Types.ObjectId;

	@Prop({
		required: true,
		minlength: 2,
	})
	title: string;

	@Prop({
		required: true,
	})
	content: string;

	@Prop({
		default:
			'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png',
	})
	image: string;

	@Prop()
	author: string;

	@Prop({
		default: 0,
	})
	view: number;
}

export const NewsSchema = SchemaFactory.createForClass(News);

export const NewsSchemaFactory = () => {
	const news_schema = NewsSchema;

	news_schema.pre('findOneAndDelete', async function (next: NextFunction) {
		// OTHER USEFUL METHOD: getOptions, getPopulatedPaths, getQuery = getFilter, getUpdate
		const organization = await this.model.findOne(this.getFilter());
		await Promise.all([]);
		return next();
	});
	return news_schema;
};