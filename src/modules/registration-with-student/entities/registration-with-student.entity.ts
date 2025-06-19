import { BaseEntity } from '@modules/shared/base/base.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { NextFunction } from 'express';

export type RegistrationWithStudentDocument = HydratedDocument<RegistrationWithStudent>;

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

export class RegistrationWithStudent extends BaseEntity {
  constructor(registration: {
    student_Id: mongoose.Types.ObjectId;
    competition_Id?: mongoose.Types.ObjectId;
    createdDate?: Date;
  }) {
    super();
    this.student_Id = registration?.student_Id;
    this.competition_Id = registration?.competition_Id;
  }

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  })
  student_Id: mongoose.Types.ObjectId;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Competition', 
  })
  competition_Id: mongoose.Types.ObjectId;
}

export const RegistrationWithStudentSchema = SchemaFactory.createForClass(RegistrationWithStudent);

export const RegistrationWithStudentSchemaFactory = () => {
  const registrationSchema = RegistrationWithStudentSchema;
  registrationSchema.pre('findOneAndDelete', async function (next: NextFunction) {
    const registration = await this.model.findOne(this.getFilter());
    return next();
  });

  return registrationSchema;
};
