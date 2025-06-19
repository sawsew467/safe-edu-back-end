import { FilterQuery } from 'mongoose';
import { Otp } from '../entities/otp.entity';

export interface OtpRepositoryInterface {
    create(createDto: any): Promise<Otp>;
    findAll();
    update(id: string, data: Partial<Otp>): Promise<Otp | null>;
    remove(id: string): Promise<boolean>;
    findOne(condition: FilterQuery<Otp>): Promise<Otp | null>;  
    findById(id : string)
}