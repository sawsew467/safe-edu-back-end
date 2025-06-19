import { FilterQuery } from 'mongoose';
import { Admin } from '../entities/admin.entity';

export interface AdminRepositoryInterface {
	create(data: Partial<Admin>): Promise<Admin>;
	findAll();
	update(id: string, data: Partial<Admin>): Promise<Admin | null>;
	remove(id: string): Promise<boolean>;
	findOne(condition: FilterQuery<Admin>): Promise<Admin | null>;  
	findById(id : string)
}
