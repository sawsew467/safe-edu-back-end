import { BaseEntity } from '@modules/shared/base/base.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { NextFunction } from 'express';

export type SupervisorDocument = HydratedDocument<Supervisor>;

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
export class Supervisor extends BaseEntity {
  constructor(supervisor: {
    first_name?: string;
    last_name?: string;
    email?: string;
    avatar?: string;
    province_id?: mongoose.Types.ObjectId[];
  }) {
    super();
    this.first_name = supervisor?.first_name;
    this.last_name = supervisor?.last_name;
    this.email = supervisor?.email;
    this.avatar = supervisor?.avatar;
    this.province_id = supervisor?.province_id;
  }

  @Prop({
    required: true,
    minlength: 2,
    maxlength: 50,
    set: (first_name: string) => first_name.trim(),
  })
  first_name: string;

  @Prop({
    required: true,
    minlength: 2,
    maxlength: 50,
    set: (last_name: string) => last_name.trim(),
  })
  last_name: string;

  @Prop({
    required: true,
    lowercase: true,
    unique: true,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  })
  email: string;

  @Prop({
    default: 'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png',
  })
  avatar?: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Province' }],
    default: [], 
  })
  province_id: mongoose.Types.ObjectId[];
}

export const SupervisorSchema = SchemaFactory.createForClass(Supervisor);

export const SupervisorSchemaFactory = () => {
  const supervisorSchema = SupervisorSchema;
  supervisorSchema.pre('findOneAndDelete', async function (next: NextFunction) {
    const supervisor = await this.model.findOne(this.getFilter());
    return next();
  });

  return supervisorSchema;
};
