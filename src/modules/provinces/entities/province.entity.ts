import { BaseEntity } from '@modules/shared/base/base.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { NextFunction } from 'express';
import { Document } from 'mongoose';

export type ProvinceDocument = Province & Document;

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
export class Province extends BaseEntity {
  constructor(province: {
    name: string;
    code: number;
    score: number;
    matches: Record<string, any>;
  }) {
    super();
    this.name = province?.name;
    this.code = province?.code;
    this.score = province?.score;
    this.matches = province?.matches;
  }

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  code: number;

  @Prop()
  score: number;

  @Prop({ type: Object })
  matches: Record<string, any>;
}

export const ProvinceSchema = SchemaFactory.createForClass(Province);

export const ProvinceSchemaFactory = () => {
    const provicne_schema = ProvinceSchema;

    provicne_schema.pre('findOneAndDelete', async function (next: NextFunction) {
        // OTHER USEFUL METHOD: getOptions, getPopulatedPaths, getQuery = getFilter, getUpdate
        const province = await this.model.findOne(this.getFilter());
        await Promise.all([]);
        return next();
    });
    return provicne_schema;
};