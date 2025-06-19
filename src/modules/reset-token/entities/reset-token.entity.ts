import { BaseEntity } from '@modules/shared/base/base.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import exp from 'constants';
import { NextFunction } from 'express';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
})
export class ResetToken extends Document {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  otp: string;
}

export const ResetTokenSchema = SchemaFactory.createForClass(ResetToken);
ResetTokenSchema.index ({createdAt: 1}, {expireAfterSeconds: 300});

export const ResetTokenSchemaFactory = () => {
  const reset_token_schema = ResetTokenSchema;

  reset_token_schema.pre('findOneAndDelete', async function (next: NextFunction) {
    // OTHER USEFUL METHOD: getOptions, getPopulatedPaths, getQuery = getFilter, getUpdate
    const resetToken = await this.model.findOne(this.getFilter());
    await Promise.all([]);
    return next();
  });
  return reset_token_schema;
};