import { BaseEntity } from '@modules/shared/base/base.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model } from 'mongoose';
import { NextFunction } from 'express';

export type AchievementDocument = HydratedDocument<Achievement>;

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
export class Achievement extends BaseEntity {
  constructor(achievement: {
    title?: string;
    description?: string;
    image_url?: string;
  }) {
    super();
    this.title = achievement?.title;
    this.description = achievement?.description;
    this.image_url = achievement?.image_url;
  }

  @Prop({
    required: true,
    minlength: 2,
    set: (title: string) => title.trim(),
  })
  title: string;

  @Prop({
    required: false,
    set: (description: string) => description?.trim(),
  })
  description?: string;

  @Prop({
    required: false,
    default: null,
  })
  image_url?: string;
}

export const AchievementSchema = SchemaFactory.createForClass(Achievement);

export const AchievementSchemaFactory = () => {
  const achievementSchema = AchievementSchema;
  achievementSchema.pre('findOneAndDelete', async function (next: NextFunction) {
    const achievement = await this.model.findOne(this.getFilter());
    await Promise.all([]);
    return next();
  });

  return achievementSchema;
};
