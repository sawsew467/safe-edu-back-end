import { Admin } from '@modules/admin/entities/admin.entity';
import { Request } from 'express';

export interface RequestWithAdmin extends Request {
	admin: Admin;
}
