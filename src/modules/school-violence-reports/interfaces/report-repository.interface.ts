import { FilterQuery, Types } from 'mongoose';
import { Report } from '../entities/report.entity';

export interface ReportRepositoryInterface {
  create(data: Partial<Report>): Promise<Report>;
  findById(id: string | Types.ObjectId): Promise<Report | null>;
  findOne(condition: FilterQuery<Report>): Promise<Report | null>;
  findAll(filter?: FilterQuery<Report>, skip?: number, limit?: number): Promise<{ items: Report[]; total: number }>;
  update(id: string | Types.ObjectId, updateData: Partial<Report>): Promise<Report | null>;
  remove(id: string): Promise<boolean>;
  count(filter?: FilterQuery<Report>): Promise<number>;
}
