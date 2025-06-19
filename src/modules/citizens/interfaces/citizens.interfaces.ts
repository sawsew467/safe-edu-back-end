import { Citizen } from '@modules/citizens/entities/citizen.entity';
import { FilterQuery } from 'mongoose';

export interface CitizensRepositoryInterface {
    create(data: Partial<Citizen>): Promise<Citizen>;
    findAll(
		searchPhase?: string,
		page?: number,
		limit?: number,
		sortBy?: string,
		sortOrder?: 'asc' | 'desc',
	): Promise<any>;
    getCitizenWithRole(CitizenId: string): Promise<Citizen | null>;
    update(id: string, data: Partial<Citizen>): Promise<Citizen | null>;
    remove(id: string): Promise<boolean>;
    findOneByCondition(condition: FilterQuery<Citizen>): Promise<Citizen | null>;
    countAllCitizens();  
}
