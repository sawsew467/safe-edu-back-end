import mongoose, { FilterQuery } from 'mongoose';
import { Supervisor } from '../entities/supervisor.entity';
export interface SupervisorRepositoryInterface {
    create(data: Partial<Supervisor>): Promise<Supervisor>;
    findAll();
    update(id: string, data: Partial<Supervisor>): Promise<Supervisor | null>;
    remove(id: string): Promise<boolean>;
    findOne(condition: FilterQuery<Supervisor>): Promise<Supervisor | null>;  
    findOneByCondition(condition: FilterQuery<Supervisor>): Promise<Supervisor | null>;
}
