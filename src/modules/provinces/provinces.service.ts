import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { ProvinceRepositoryInterface } from './interfaces/provinces.interface';
import { Province } from './entities/province.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ProvinceService {
  private readonly apiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject('ProvinceRepositoryInterface')
    private readonly provinceRepository: ProvinceRepositoryInterface,
    @InjectModel(Province.name)
    private readonly provinceModel: Model<Province>
  ) {
    this.apiUrl = this.configService.get<string>('API_PROVINCES_VIETNAM');
  }

  async getProvinces(): Promise<any> {
    try {
      const response$ = this.httpService.get(this.apiUrl);
      const response = await lastValueFrom(response$);
      return response.data;
    } catch (error) {
      throw new Error('Không thể lấy danh sách tỉnh thành');
    }
  }

  async addProvinceIntoDatabase(): Promise<void> {
    const provinces = await this.getProvinces();

    // If no provinces returned, nothing to do
    if (!provinces || provinces.length === 0) return;

    // Prepare bulk upsert operations. Match by `code` to avoid duplicate key errors
    // - If a province with the same code exists, update its fields
    // - If it does not exist, insert a new document
    const bulkOps = provinces.map((province: any) => ({
      updateOne: {
        filter: { code: province.code },
        update: {
          $set: {
            name: province.name,
            code: province.code,
            score: province.score ?? null,
            matches: province.matches ?? null,
            updated_at: new Date(),
          },
          $setOnInsert: {
            created_at: new Date(),
          },
        },
        upsert: true,
      },
    }));

    try {
      await this.provinceModel.bulkWrite(bulkOps, { ordered: false });
    } catch (error) {
      throw new Error(`Error saving provinces: ${error?.message ?? error}`);
    }
    
      // Remove provinces that are in the database but not present in the latest fetched list.
      // This ensures the DB mirrors exactly the source list (delete obsolete entries).
      try {
        const codes = provinces.map((p: any) => p.code).filter((c: any) => c !== undefined && c !== null);
        if (codes.length > 0) {
          await this.provinceModel.deleteMany({ code: { $nin: codes } });
        }
      } catch (error) {
        // Deletion failure should not be fatal to the whole import; surface a clear message.
        throw new Error(`Error deleting obsolete provinces: ${error?.message ?? error}`);
      }
  }

  async findOne(_id: string): Promise<Province> {
    return await this.provinceRepository.findOne({_id});
  }

  async findAll() {
    return await this.provinceRepository.findAll()
  }

  async getAllProvincesWithVisitCount() {
    return this.provinceModel.aggregate([
      {
        $lookup: {
          from: 'provincevisits',
          localField: '_id',
          foreignField: 'province',
          as: 'visitData',
        },
      },
      {
        $unwind: {
          path: '$visitData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          code: 1,
          score: 1,
          visit_count: { $ifNull: ['$visitData.visit_count', 0] },
        },
      },
    ]);
  }
}