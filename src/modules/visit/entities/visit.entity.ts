import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { NextFunction } from 'express';
import { Document } from 'mongoose';

@Schema({ timestamps: true }) // auto tạo createdAt
export class Visit extends Document {
  @Prop({ default: Date.now })
  timestamp: Date;

@Prop({ required: true })
  ipAddress: string;
}

export const VisitSchema = SchemaFactory.createForClass(Visit);
export const VisitSchemaFactory = () => {
    const visit_schema = VisitSchema;

    visit_schema.pre('findOneAndDelete', async function (next: NextFunction) {
        // OTHER USEFUL METHOD: getOptions, getPopulatedPaths, getQuery = getFilter, getUpdate
        const visit = await this.model.findOne(this.getFilter());
        await Promise.all([]);
        return next();
    });
    return visit_schema;
};