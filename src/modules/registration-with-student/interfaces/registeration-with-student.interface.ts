import { FilterQuery, Types } from 'mongoose';
import { RegistrationWithStudent } from '../entities/registration-with-student.entity';

export interface RegistrationWithStudentRepositoryInterface {
  create(data: Partial<RegistrationWithStudent>): Promise<RegistrationWithStudent>;
  findAll(): Promise<{ items: RegistrationWithStudent[]; total: number }>;
  findOne(condition: FilterQuery<RegistrationWithStudent>): Promise<RegistrationWithStudent | null>;
  update(id: string, data: Partial<RegistrationWithStudent>): Promise<RegistrationWithStudent | null>;
  remove(id: string): Promise<boolean>;
  softDelete(id: string | Types.ObjectId): Promise<RegistrationWithStudent | null>;
}
