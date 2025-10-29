import { FilterQuery, Types } from 'mongoose';
import { ReportStatusHistory } from '../entities/report-status-history.entity';

export interface ReportStatusHistoryRepositoryInterface {
  create(data: Partial<ReportStatusHistory>): Promise<ReportStatusHistory>;
  findById(id: string | Types.ObjectId): Promise<ReportStatusHistory | null>;
  findOne(condition: FilterQuery<ReportStatusHistory>): Promise<ReportStatusHistory | null>;
  findAll(filter?: FilterQuery<ReportStatusHistory>, skip?: number, limit?: number): Promise<{ items: ReportStatusHistory[]; total: number }>;
  update(id: string | Types.ObjectId, updateData: Partial<ReportStatusHistory>): Promise<ReportStatusHistory | null>;
  remove(id: string): Promise<boolean>;
  count(filter?: FilterQuery<ReportStatusHistory>): Promise<number>;
  findByReportId(reportId: string): Promise<ReportStatusHistory[]>;
  findByReportIds(reportIds: string[]): Promise<ReportStatusHistory[]>;
}
