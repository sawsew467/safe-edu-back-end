import { BaseEntity } from '@modules/shared/base/base.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { NextFunction } from 'express';

export type UserAchievementDocument = HydratedDocument<UserAchievement>;

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

export class UserAchievement extends BaseEntity {
  constructor(userAchievement: {
    student_Id?:  mongoose.Types.ObjectId;
    citizen_Id?: mongoose.Types.ObjectId;
    achievement_Id:  mongoose.Types.ObjectId;
  }) {
    super();
    this.student_Id = userAchievement?.student_Id;
    this.citizen_Id = userAchievement?.citizen_Id;
    this.achievement_Id = userAchievement?.achievement_Id; 
  }

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  })
  student_Id?: mongoose.Types.ObjectId;
  
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Citizen',
  })
  citizen_Id?: mongoose.Types.ObjectId;
  
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement',
  })
  achievement_Id: mongoose.Types.ObjectId;
}

export const UserAchievementSchema = SchemaFactory.createForClass(UserAchievement);

export const UserAchievementSchemaFactory = () => {
  const userAchievementSchema = UserAchievementSchema;
  userAchievementSchema.pre('findOneAndDelete', async function (next: NextFunction) {
    const userAchievement = await this.model.findOne(this.getFilter());
    return next();
  });

  return userAchievementSchema;
};
