import { BaseEntity } from '@modules/shared/base/base.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model, Types } from 'mongoose';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { NextFunction } from 'express';

// INNER

// OUTER
import { Organization } from '@modules/organizations/entities/organization.entity';

export type StudentDocument = HydratedDocument<Student>;

export enum GENDER {
	MALE = 'Male',
	FEMALE = 'Female',
	OTHER = 'Other',
}

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
export class Student extends BaseEntity {
	constructor(Student: {
		first_name?: string;
		last_name?: string;
		gender?: GENDER;
		phone_number?: string;
		date_of_birth?: Date;
		organizationId?: mongoose.Types.ObjectId;
		password: string;
		username: string;
		email: string;
	}) {
		super();
		this.first_name = Student?.first_name;
		this.last_name = Student?.last_name;
		this.gender = Student?.gender;
		this.phone_number = Student?.phone_number;
		this.date_of_birth = Student?.date_of_birth;
		this.organizationId = Student?.organizationId;
		this.password = Student?.password;
		this.username = Student?.username;
		this.email = Student?.email;
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
		match: /^\+84\d{9}$/,
	})
	phone_number?: string;

	@Prop({
		type: mongoose.Schema.Types.ObjectId, 
		ref: 'Organization'
	})
	organizationId: mongoose.Types.ObjectId;

	@Prop({
		default:
			'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png',
	})
	avatar?: string;

	@Prop()
	date_of_birth?: Date;

	@Prop({
		enum: GENDER,
	})
	gender: GENDER;

	@Prop()
	@Exclude()
	current_refresh_token?: string;

	@Expose({ name: 'full_name' })
	get fullName(): string {
		return `${this.first_name} ${this.last_name}`;
	}

	@Prop({
		type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserAchievement' }],
		default: [],
	})
	achievements: mongoose.Types.ObjectId[];

	@Prop({
		type: [
			{ type: mongoose.Schema.Types.ObjectId, ref: 'RegistrationWithStudent' },
		],
		default: [],
	})
	registration_competition: mongoose.Types.ObjectId[];
	@Prop({
		required: true,
		unique: true,
	})
	username: string;
	@Prop({
		required: true,
	})
	password: string;
	@Prop({
		required: false,
	})
	email: string;
}
export const StudentSchema = SchemaFactory.createForClass(Student);
StudentSchema.index({ username: 1 }, { unique: true, background: true });

export const StudentSchemaFactory = () => {
	const Student_schema = StudentSchema;

	Student_schema.pre('findOneAndDelete', async function (next: NextFunction) {
		// OTHER USEFUL METHOD: getOptions, getPopulatedPaths, getQuery = getFilter, getUpdate
		const Student = await this.model.findOne(this.getFilter());
		await Promise.all([]);
		return next();
	});
	return Student_schema;
};
