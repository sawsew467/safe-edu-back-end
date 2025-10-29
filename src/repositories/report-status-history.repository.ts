import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { ReportStatusHistory } from '@modules/school-violence-reports/entities/report-status-history.entity';
import { ReportStatusHistoryRepositoryInterface } from '@modules/school-violence-reports/interfaces/report-status-history-repository.interface';

@Injectable()
export class ReportStatusHistoryRepository implements ReportStatusHistoryRepositoryInterface {
  constructor(
    @InjectModel(ReportStatusHistory.name) private readonly historyModel: Model<ReportStatusHistory>,
  ) {}

  async create(data: Partial<ReportStatusHistory>): Promise<ReportStatusHistory> {
    const newHistory = new this.historyModel(data);
    return await newHistory.save();
  }

  async findById(id: string | Types.ObjectId): Promise<ReportStatusHistory | null> {
    const stringId = id instanceof Types.ObjectId ? id.toString() : id;
    return await this.historyModel.findById(stringId).exec();
  }

  async findOne(condition: FilterQuery<ReportStatusHistory>): Promise<ReportStatusHistory | null> {
    return await this.historyModel.findOne(condition).exec();
  }

  async findAll(
    filter: FilterQuery<ReportStatusHistory> = {},
    skip: number = 0,
    limit: number = 10,
  ): Promise<{ items: ReportStatusHistory[]; total: number }> {
    const items = await this.historyModel
      .find(filter)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.historyModel.countDocuments(filter).exec();

    return { items, total };
  }

  async update(
    id: string | Types.ObjectId,
    updateData: Partial<ReportStatusHistory>,
  ): Promise<ReportStatusHistory | null> {
    const stringId = id instanceof Types.ObjectId ? id.toString() : id;
    return await this.historyModel
      .findByIdAndUpdate(stringId, updateData, { new: true })
      .exec();
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.historyModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async count(filter: FilterQuery<ReportStatusHistory> = {}): Promise<number> {
    return await this.historyModel.countDocuments(filter).exec();
  }

  async findByReportId(reportId: string): Promise<ReportStatusHistory[]> {
    return await this.historyModel
      .find({ reportId: new Types.ObjectId(reportId) })
      .sort({ created_at: 1 })
      .exec();
  }

  async findByReportIds(reportIds: string[]): Promise<ReportStatusHistory[]> {
    const objectIds = reportIds.map(id => new Types.ObjectId(id));
    return await this.historyModel
      .find({ reportId: { $in: objectIds } })
      .sort({ reportId: 1, created_at: 1 })
      .exec();
  }
}
