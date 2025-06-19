import { FilterQuery } from 'mongoose';
import { Manager } from '../entities/manager.entity';

export interface ManagerRepositoryInterface {
	create(data: Partial<Manager>): Promise<Manager>;
	findAll();
	update(id: string,data: Partial<Manager>): Promise<Manager | null>;
	remove(id: string): Promise<boolean>;
	findOne(condition: FilterQuery<Manager>): Promise<Manager | null>;  
	findById(id : string)
	findOneByCondition(condition: FilterQuery<Manager>): Promise<Manager | null>;  
}
