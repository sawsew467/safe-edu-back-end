import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ProvinceVisit } from './entities/province-vist.entity';
import mongoose, { Model } from 'mongoose';

@Injectable()
export class ProvinceVisitService {
   constructor(
    @InjectModel(ProvinceVisit.name)
    private readonly provinceVisitModel: Model<ProvinceVisit>,
  ) {}

  async increaseVisit(provinceId: string): Promise<void> {
      try {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const provinceObjectId = new mongoose.Types.ObjectId(provinceId);

        const provinceVisit = await this.provinceVisitModel.findOne({
          province: provinceObjectId
        });

        if (!provinceVisit) {
          await this.provinceVisitModel.create({
            province: provinceObjectId,
            visit_count: 1,
            timestamp: new Date(),
          });
        } else if (provinceVisit.timestamp < fiveMinutesAgo) {
          await this.provinceVisitModel.findOneAndUpdate(
            { province: provinceObjectId },
            {
              $inc: { visit_count: 1 },
              $set: { timestamp: new Date() },
            }
          );
        }

      } catch (error) {
        throw new BadRequestException({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message,
          message: 'Có lỗi xảy ra, vui lòng thử lại sau',
        });
      }
  }

  async getStats(): Promise<any[]> {
    return this.provinceVisitModel
      .find()
      .populate('province', 'name');
  }
}
