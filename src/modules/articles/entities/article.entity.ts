import { BaseEntity } from '@modules/shared/base/base.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model } from 'mongoose';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { NextFunction } from 'express';

export type ArticleDocument = HydratedDocument<Article>;

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
export class Article extends BaseEntity {
  constructor(article: {
    category_Id?: mongoose.Types.ObjectId;
    title?: string;
    image_url?: string;
    author?: string;
    content?: string;
    video?: string;
    status?: 'Published' | 'Draft';
  }) {
    super();
    this.category_Id = article?.category_Id;
    this.title = article?.title;
    this.image_url = article?.image_url;
    this.author = article?.author;
    this.content = article?.content;
    this.video = article?.video;
    this.status = article?.status || 'Draft';
  }

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  })
  category_Id: mongoose.Types.ObjectId;

  @Prop({
    required: true,
    minlength: 5,
    maxlength: 100,
    set: (title: string) => title.trim(),
  })
  title: string;

  @Prop({
    required: false,
    default: null,
  })
  image_url: string;

  @Prop({
    required: false,
    minlength: 3,
    maxlength: 50,
    set: (author: string) => author.trim(),
  })
  author: string;

  @Prop({
    required: true,
  })
  content: string;

  @Prop({
    required: false,
    default: null,
  })
  video: string;

  @Prop({
    required: true,
    enum: ['Published', 'Draft'],
    default: 'Draft',
  })
  status: 'Published' | 'Draft';
}

export const ArticleSchema = SchemaFactory.createForClass(Article);

export const ArticleSchemaFactory = () => {
  const articleSchema = ArticleSchema;
  articleSchema.pre('findOneAndDelete', async function (next: NextFunction) {
    const article = await this.model.findOne(this.getFilter());
    return next();
  });

  return articleSchema;
};
