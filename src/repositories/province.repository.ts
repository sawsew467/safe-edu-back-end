import { Province } from '@modules/provinces/entities/province.entity';
import { ProvinceRepositoryInterface } from '@modules/provinces/interfaces/provinces.interface';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, ObjectId, Types } from 'mongoose';

@Injectable()
export class ProvinceRepository implements ProvinceRepositoryInterface {
  constructor(
    @InjectModel(Province.name) private readonly provinceModel: Model<Province>,
  ) { }

  async create(data: Partial<Province>): Promise<Province> {
    console.log('data:', JSON.stringify(data, null, 2));

    try {
      const newProvince = new this.provinceModel(data);
      const savedProvince = await newProvince.save();
      return savedProvince;
    } catch (error) {
      console.error('Error saving new province:', error.message);
      throw new BadRequestException('Failed to create province. Please try again.');
    }
  }

  async findAll() {
    const provinces = await this.provinceModel
      .find()
      .exec();
    const total = await this.provinceModel.countDocuments().exec();
    return { items: provinces, total };
  }

  async update(id: string, data: Partial<Province>): Promise<Province | null> {
    return await this.provinceModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async remove(id: string | Types.ObjectId): Promise<Province> {
    const stringId = id instanceof Types.ObjectId ? id.toString() : id;
    return this.provinceModel.findByIdAndUpdate(stringId, { deleted_at: new Date(), isActive: false }, { new: true }).exec();
  }

  async findOne(condition: FilterQuery<Province>): Promise<Province | null> {
    return await this.provinceModel.findOne(condition).exec();
  }

  async countOrganizationsByProvince(): Promise<any[]> {
    const result = await this.provinceModel.aggregate([
      {
        $lookup: {
          from: 'organizations',
          localField: '_id',
          foreignField: 'province_id',
          as: 'organizations',
        },
      },
      {
        $project: {
          provinceName: '$name',
          count: { $size: '$organizations' },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);
    return result;
  }


}
