import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Report } from '@modules/school-violence-reports/entities/report.entity';
import { ReportRepositoryInterface } from '@modules/school-violence-reports/interfaces/report-repository.interface';

@Injectable()
export class ReportRepository implements ReportRepositoryInterface {
  constructor(
    @InjectModel(Report.name) private readonly reportModel: Model<Report>,
  ) {}

  async create(data: Partial<Report>): Promise<Report> {
    const newReport = new this.reportModel(data);
    return await newReport.save();
  }

  async findById(id: string | Types.ObjectId): Promise<Report | null> {
    const stringId = id instanceof Types.ObjectId ? id.toString() : id;
    return await this.reportModel
      .findById(stringId)
      .populate('organizationId')
      .exec();
  }

  async findOne(condition: FilterQuery<Report>): Promise<Report | null> {
    return await this.reportModel
      .findOne(condition)
      .populate('organizationId')
      .exec();
  }

  async findAll(
    filter: FilterQuery<Report> = {},
    skip: number = 0,
    limit: number = 10,
  ): Promise<{ items: Report[]; total: number }> {
    const items = await this.reportModel
      .find(filter)
      .populate('organizationId')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.reportModel.countDocuments(filter).exec();

    return { items, total };
  }

  async update(
    id: string | Types.ObjectId,
    updateData: Partial<Report>,
  ): Promise<Report | null> {
    const stringId = id instanceof Types.ObjectId ? id.toString() : id;
    return await this.reportModel
      .findByIdAndUpdate(stringId, updateData, { new: true })
      .populate('organizationId')
      .exec();
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.reportModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async count(filter: FilterQuery<Report> = {}): Promise<number> {
    return await this.reportModel.countDocuments(filter).exec();
  }
}
