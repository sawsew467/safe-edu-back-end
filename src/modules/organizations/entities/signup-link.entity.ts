import { BaseEntity } from '@modules/shared/base/base.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type SignUpLinkDocument = HydratedDocument<SignUpLink>;

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
export class SignUpLink extends BaseEntity {
	constructor(signUpLink: {
		organization_id: mongoose.Types.ObjectId;
		start_date: Date;
		expiration_date: Date;
		is_revoked: boolean;
	}) {
		super();
		this.organization_id = signUpLink?.organization_id;
		this.start_date = signUpLink?.start_date;
		this.expiration_date = signUpLink?.expiration_date;
		this.is_revoked = signUpLink?.is_revoked || false;
	}

	@Prop({
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Organization',
		required: true,
	})
	organization_id: mongoose.Types.ObjectId;

	@Prop({ required: true })
	start_date: Date;

	@Prop({ required: true })
	expiration_date: Date;

	@Prop({ default: false })
	is_revoked: boolean;

	@Prop({ default: null })
	revoked_at: Date;

	@Prop({ default: null })
	revoked_by: string;
}

export const SignUpLinkSchema = SchemaFactory.createForClass(SignUpLink);

export const SignUpLinkSchemaFactory = () => {
	const signUpLinkSchema = SignUpLinkSchema;
	return signUpLinkSchema;
};
