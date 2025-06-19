import { Prop } from '@nestjs/mongoose';
import { Expose, Transform } from 'class-transformer';
import { ObjectId } from 'mongoose';

export class BaseEntity {
	_id?: ObjectId | string;

	@Expose()
	@Transform((value) => value.obj?._id?.toString(), { toClassOnly: true })
	id?: string;

	@Prop({default: true})
	isActive?: boolean;

	@Prop({ default: null })
	deleted_at?: Date;

	@Prop({ default: null })
	deleted_by?: string;

	@Prop({ default: null })
	created_by?: string;

	@Prop({ default: null })
	update_by?: string;

}
