import { BaseEntity } from '@modules/shared/base/base.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { NextFunction } from 'express';

export type RegistrationWithCitizenDocument = HydratedDocument<RegistrationWithCitizen>;

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

export class RegistrationWithCitizen extends BaseEntity {
  constructor(registration: {
    competition_Id?: mongoose.Types.ObjectId;
    citizen_Id?: mongoose.Types.ObjectId;
    createdDate?: Date;
  }) {
    super();
    this.citizen_Id = registration?.citizen_Id;
    this.competition_Id = registration?.competition_Id;
  }

    @Prop({
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student', 
    })
    citizen_Id: mongoose.Types.ObjectId;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Competition',
  })
  competition_Id: mongoose.Types.ObjectId;
}

export const RegistrationWithCitizenSchema = SchemaFactory.createForClass(RegistrationWithCitizen);

export const RegistrationWithCitizenSchemaFactory = () => {
  const registrationSchema = RegistrationWithCitizenSchema;
  registrationSchema.pre('findOneAndDelete', async function (next: NextFunction) {
    const registration = await this.model.findOne(this.getFilter());
    return next();
  });

  return registrationSchema;
};
