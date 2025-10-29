import { BaseEntity } from '@modules/shared/base/base.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { auditFieldsPlugin } from 'src/plugins/audit-fields.plugin';

export type EmergencyContactDocument = HydratedDocument<EmergencyContact>;

@Schema({
	timestamps: {
		createdAt: 'created_at',
		updatedAt: 'updated_at',
	},
})
export class EmergencyContact extends BaseEntity {
	@Prop({
		required: false,
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Organization',
	})
	organizationId?: mongoose.Types.ObjectId;

	@Prop({ required: true })
	name: string;

	@Prop({ required: true })
	phoneNumber: string;

	@Prop({ required: true })
	email: string;

	@Prop({
		required: true,
		enum: ['board-of-directors', 'principal', 'vice-principal', 'student-affairs-officer']
	})
	role: string;

	@Prop({ required: true, default: true })
	isActive: boolean;
}

export const EmergencyContactSchema = SchemaFactory.createForClass(EmergencyContact);

EmergencyContactSchema.plugin(auditFieldsPlugin);
