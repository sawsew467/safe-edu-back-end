import { FilterQuery, ObjectId, Types } from 'mongoose';
import { Organization } from '../entities/organization.entity';

export interface OrganizationsRepositoryInterface {
	create(data: Partial<Organization>): Promise<Organization>;
	findAll();
	update(id: string, data: Partial<Organization>): Promise<Organization | null>;
	remove(id: string | Types.ObjectId): Promise<Organization | null>;
	findOne(condition: FilterQuery<Organization>): Promise<Organization | null>;  
	findById(id : string)
	findAllWithPaging(query: Record<string, any>, current: number, pageSize: number);
	setIsActive(id: string): Promise<Organization | null>
	countAll(): Promise<number>;
	countOrganizationsByProvince():Promise<any[]>
}
