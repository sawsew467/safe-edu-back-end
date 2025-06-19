import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, Types } from 'mongoose';
import { FindAllResponse, QueryParams } from 'src/types/common.type';
import { Category, CategoryDocument } from '@modules/category/entities/category.entity';
import { CategoriesRepositoryInterface } from '@modules/category/interfaces/category.interface';

@Injectable()
export class CategoriesRepository implements CategoriesRepositoryInterface {
  constructor(
    @InjectModel(Category.name)
    private readonly category_model: Model<CategoryDocument>,
  ) { }

  // Method to create a new category
  async create(createDto: any): Promise<Category> {
    const createdCategory = new this.category_model(createDto);
    return createdCategory.save(); 
  }

  // Method to find all categories with optional pagination
  async findAll(): Promise<FindAllResponse<Category>> {
    const categories = await this.category_model
      .find()
      .populate('topic_id')
      .exec();

    return {
      count: categories.length, // Tổng số mục
      items: categories,        // Danh sách mục
    };
  }

  // Find one category by condition
  async findOneByCondition(condition: FilterQuery<Category>): Promise<Category | null> {
    return this.category_model
      .findOne(condition)
      .populate('topic_id')
      .exec();
  }

  async findById(id: string): Promise<Category | null> {
          return await this.category_model.findById(id)
              .populate('topic_id')
              .exec();
      }

  // Method to update category by ID
  async update(id: string | Types.ObjectId, updateData: any): Promise<Category | null> {
    const stringId = id instanceof Types.ObjectId ? id.toString() : id;
    return this.category_model.findByIdAndUpdate(stringId, updateData, { new: true }).exec();
  }

  // Soft delete category by ID (mark as deleted)
  async delete(id: string | Types.ObjectId): Promise<Category | null> {
    const stringId = id instanceof Types.ObjectId ? id.toString() : id;
    return this.category_model.findByIdAndUpdate(stringId, { deleted_at: new Date(), isActive: false }, { new: true }).exec();
  }

  async countTotalViews(): Promise<number> {
    const result = await this.category_model.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$view' }
        }
      }
    ]);

    return result[0]?.totalViews || 0;
  }

}
