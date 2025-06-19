import { Organization } from '../../organizations/entities/organization.entity';
import { BaseEntity } from '@modules/shared/base/base.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model, Types } from 'mongoose';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { NextFunction } from 'express';


// INNER

// OUTER
export enum GENDER {
	MALE = 'Male',
	FEMALE = 'Female',
	OTHER = 'Other',
}

export type managerDocument = HydratedDocument<Manager>;

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
export class Manager extends BaseEntity {
	constructor(Manager: {
		first_name?: string;
		last_name?: string;
		email?: string;
		gender?: GENDER;
		phone_number?: string;
		organizationId?: mongoose.Types.ObjectId[];
	}) {
		super();
		this.first_name = Manager?.first_name;
		this.last_name = Manager?.last_name;
		this.email = Manager?.email;
		this.gender = Manager?.gender;
		this.phone_number = Manager?.phone_number;
		this.organizationId = Manager?.organizationId;

	}

	@Prop({
		required: true,
		minlength: 2,
		maxlength: 60,
		set: (first_name: string) => {
			return first_name.trim();
		},
	})
	first_name: string;

	@Prop({
		required: true,
		minlength: 2,
		maxlength: 60,
		set: (last_name: string) => {
			return last_name.trim();
		},
	})
	last_name: string;

	@Prop({
		required: true,
		unique: true,
		match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
	})
	// @Expose({ name: 'mail', toPlainOnly: true })
	email: string;

	@Prop({
		match: /^\+84\d{9}$/,
		required: true,
	})
	phone_number: string;

	@Exclude()
	@Prop()
	password?: string;

	@Prop({ default: false })
	is_registered_with_google?: boolean;

	@Prop({
		default:
			'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png',
	})
	avatar?: string;


	@Prop({
		enum: GENDER,
	})
	gender: GENDER;


	@Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }] })
	organizationId: mongoose.Types.ObjectId[];

	@Prop()
	@Exclude()
	current_refresh_token?: string;

	@Expose({ name: 'full_name' })
	get fullName(): string {
		return `${this.first_name} ${this.last_name}`;
	}
}

export const ManagerSchema = SchemaFactory.createForClass(Manager);

export const ManagerSchemaFactory = () => {
	const Manager_schema = ManagerSchema;
	Manager_schema.pre('findOneAndDelete', async function (next: NextFunction) {
		// OTHER USEFUL METHOD: getOptions, getPopulatedPaths, getQuery = getFilter, getUpdate
		const Manager = await this.model.findOne(this.getFilter());
		await Promise.all([]);
		return next();
	});
	return Manager_schema;
};
