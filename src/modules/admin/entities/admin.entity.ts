import { BaseEntity } from '@modules/shared/base/base.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model } from 'mongoose';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { NextFunction } from 'express';


export type adminDocument = HydratedDocument<Admin>;

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
export class Admin extends BaseEntity {
	constructor(admin: {
		first_name?: string;
		last_name?: string;
		email?: string;
		phone_number?: string;
		avatar_url?: string;
	}) {
		super();
		this.first_name = admin?.first_name;
		this.last_name = admin?.last_name;
		this.email = admin?.email;
		this.phone_number = admin?.phone_number;
		this.avatar_url = admin?.avatar_url;
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
	phone_number?: string;

	@Prop({
		default:
			'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png',
	})
	avatar_url?: string;

	@Prop()
	@Exclude()
	current_refresh_token?: string;

	@Expose({ name: 'full_name' })
	get fullName(): string {
		return `${this.first_name} ${this.last_name}`;
	}

	@Prop({
		default: true, // Đặt giá trị mặc định là true
	})
	isActive?: boolean;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);

export const AdminSchemaFactory = () => {
	const admin_schema = AdminSchema;

	// admin_schema.pre('findOneAndDelete', async function (next: NextFunction) {
	// 	// OTHER USEFUL METHOD: getOptions, getPopulatedPaths, getQuery = getFilter, getUpdate
	// 	const admin = await this.model.findOne(this.getFilter());
	// 	await Promise.all([]);
	// 	return next();
	// });
	return admin_schema;
};
