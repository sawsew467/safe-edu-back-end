import { BaseEntity } from '@modules/shared/base/base.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { NextFunction } from 'express';

export type NotificationDocument = HydratedDocument<Notification>;

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

export class Notification extends BaseEntity {
  constructor(notification: {
    deviceId?: number;
    title?: string;
    description?: string;
  }) {
    super();
    this.deviceId = notification?.deviceId;
    this.title = notification?.title;
    this.description = notification?.description;
  }

  @Prop({
    required: true,
    type: Number,
  })
  deviceId: number;

  @Prop({
    required: true,
    minlength: 5,
    maxlength: 100,
    set: (title: string) => title.trim(),
  })
  title: string;

  @Prop({
    required: true,
    maxlength: 500,
    set: (description: string) => description.trim(),
  })
  description: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

export const NotificationSchemaFactory = () => {
  const notificationSchema = NotificationSchema;

  // Add pre-hook logic if needed
  notificationSchema.pre('findOneAndDelete', async function (next: NextFunction) {
    const notification = await this.model.findOne(this.getFilter());

    // Add cascading deletion logic here if necessary
    return next();
  });

  return notificationSchema;
};
