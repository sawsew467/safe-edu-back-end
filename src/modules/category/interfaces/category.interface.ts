// src/modules/categories/interfaces/categories.interface.ts

import { FindAllResponse, QueryParams } from 'src/types/common.type';
import { Category } from '../entities/category.entity';
import { FilterQuery } from 'mongoose';

export interface CategoriesRepositoryInterface {
  create(createDto: any): Promise<Category>;
  findAll(): Promise<FindAllResponse<Category>>;
  findOneByCondition(condition: FilterQuery<Category>): Promise<Category | null>;
  update(id: string, updateData: any): Promise<Category | null>;
  delete(id: string): Promise<Category | null>;
  countTotalViews(): Promise<number>;
  findById(id : string): Promise<Category | null>;
}
