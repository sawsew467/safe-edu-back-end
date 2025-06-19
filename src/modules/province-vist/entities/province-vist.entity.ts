import { BaseEntity } from '@modules/shared/base/base.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { NextFunction } from 'express';
import mongoose, { Document, Types } from 'mongoose';

@Schema({ timestamps: true }) 
export class ProvinceVisit extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Province', unique: true })
  province: Types.ObjectId;

  @Prop({ default: 0 })
  visit_count: number;

  @Prop({ default: Date.now })
  timestamp: Date;
}

export const ProvinceVisitSchema = SchemaFactory.createForClass(ProvinceVisit);

export const ProvinceVisitSchemaFactory = () => {
    const province_visit_schema = ProvinceVisitSchema;

    province_visit_schema.pre('findOneAndDelete', async function (next: NextFunction) {
        // OTHER USEFUL METHOD: getOptions, getPopulatedPaths, getQuery = getFilter, getUpdate
        const Citizen = await this.model.findOne(this.getFilter());
        await Promise.all([]);
        return next();
    });
    return province_visit_schema;
};
