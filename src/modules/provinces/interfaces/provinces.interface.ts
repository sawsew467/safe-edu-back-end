import { FilterQuery, ObjectId } from 'mongoose';
import { Province } from "../entities/province.entity";

export interface ProvinceRepositoryInterface {
    create(data: Partial<Province>): Promise<Province>;
    update(id: string, data: Partial<Province>): Promise<Province | null>;
    remove(id: string): Promise<Province>;
    findOne(condition: FilterQuery<Province>):Promise<Province | null>;
    findAll();
}