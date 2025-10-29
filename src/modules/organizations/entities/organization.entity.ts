import { ManagerSchema } from '@modules/manager/entities/manager.entity';
import { BaseEntity } from '@modules/shared/base/base.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude } from 'class-transformer';
import { NextFunction } from 'express';
import mongoose, {
	HydratedDocument,
	StringExpressionOperatorReturningBoolean,
} from 'mongoose';
import { runInThisContext } from 'vm';

export type OrganizationDocument = HydratedDocument<Organization>;

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
export class Organization extends BaseEntity {
	constructor(organization: {
		name: string;
		province_id: mongoose.Types.ObjectId;
		manager_id: mongoose.Types.ObjectId[];
	}) {
		super();
		this.name = organization?.name;
		this.province_id = organization.province_id;
		this.manager_id = organization.manager_id;
	}

	@Prop()
	name: string;

	@Prop({
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Province',
	})
	province_id: mongoose.Types.ObjectId;

	@Prop({
		type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Manager' }],
		default: [],
	})
	manager_id: mongoose.Types.ObjectId[];

	@Prop()
	email: string;

	@Prop()
	slug: string;

	@Prop({ required: false })
	principal_name?: string;

	@Prop({ required: false })
	principal_phone?: string;

	@Prop({ required: false })
	principal_email?: string;

	@Prop({ required: false })
	vice_principal_name?: string;

	@Prop({ required: false })
	vice_principal_phone?: string;

	@Prop({ required: false })
	vice_principal_email?: string;
}

export const OrganizationsSchema = SchemaFactory.createForClass(Organization);

const ManagerModel = mongoose.model('Manager', ManagerSchema);
export const OrganizationSchemaFactory = () => {
	const organization_schema = OrganizationsSchema;

	organization_schema.post('save', async function (doc, next) {
		if (doc.manager_id && doc.manager_id.length > 0) {
			await ManagerModel.updateOne(
				{ _id: { $in: doc.manager_id } },
				{ $set: { organizationId: doc._id } },
			);
		}
		next();
	});

	return organization_schema;
};
