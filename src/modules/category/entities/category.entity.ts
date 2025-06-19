import { BaseEntity } from '@modules/shared/base/base.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model } from 'mongoose';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { NextFunction } from 'express';

export type CategoryDocument = HydratedDocument<Category>;

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

export class Category extends BaseEntity {
  save() {
    throw new Error('Method not implemented.');
  }
	constructor(Category: {
		category_name?: string;
        topic_id?: mongoose.Types.ObjectId;
		description?: string;
        image?: string;
		view?:number
		
	}) {
		super();
		this.category_name = Category?.category_name;
        this.topic_id = Category?.topic_id;
        this.description = Category?.description;
        this.image = Category?.image;
		this.view = Category?.view;
	}
	
	@Prop()
	category_name: string;

	@Prop({
		required: true,
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Topic',
	})
	topic_id: mongoose.Types.ObjectId;

    @Prop()
	description: string;
	
	@Prop({
		required: false,
    	default: null,
	})
	image: string;

	@Prop({
		type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'News' }],
	})
	news: mongoose.Types.ObjectId[];

	@Prop({
		type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
	})
	articles: mongoose.Types.ObjectId[];

	@Prop({
		default: 0,
	})
	view: number;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

export const CategorySchemaFactory = () => {
  const category_schema = CategorySchema;

  category_schema.pre('findOneAndDelete', async function (next: NextFunction) {
    const category = await this.model.findOne(this.getFilter());
    await Promise.all([]); 
    return next();
  });

  return category_schema;
};

