import { BaseEntity } from '@modules/shared/base/base.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model } from 'mongoose';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { NextFunction } from 'express';

export type CompetitionDocument = HydratedDocument<Competition>;

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
export class Competition extends BaseEntity {
  constructor(competition: {
    title?: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    image_url?: string;
    organizationId?: mongoose.Types.ObjectId;

    isPublic?: string;

  }) {
    super();
    this.title = competition?.title;
    this.description = competition?.description;
    this.startDate = competition?.startDate;
    this.endDate = competition?.endDate;
    this.image_url = competition?.image_url;
    this.organizationId = competition?.organizationId;
    this.isPublic = competition?.isPublic;
  }

  @Prop({
    required: true,
    maxlength: 100,
    set: (title: string) => title.trim(),
  })
  title: string;

  @Prop({
    maxlength: 500,
    set: (description: string) => description.trim(),
  })
  description: string;

  @Prop({
    required: true,
    type: Date,
  })
  startDate: Date;

  @Prop({
    required: true,
    type: Date,
  })
  endDate: Date;

  @Prop({
    required: false,
    default: null,
  })
  image_url: string;


  @Prop({   type: mongoose.Schema.Types.ObjectId, ref: 'Organization'  })

  organizationId: mongoose.Types.ObjectId;

  @Prop({
    required: true
  })
  slug: string

  @Prop({
    default: 'public',
  })
  isPublic: string
}

export const CompetitionSchema = SchemaFactory.createForClass(Competition);

export const CompetitionSchemaFactory = () => {
  const competitionSchema = CompetitionSchema;
  competitionSchema.pre('findOneAndDelete', async function (next: NextFunction) {
    const competition = await this.model.findOne(this.getFilter());
    return next();
  });

  return competitionSchema;
};
