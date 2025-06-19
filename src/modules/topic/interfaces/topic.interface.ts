// src/modules/topics/interfaces/topics.interface.ts

import { FindAllResponse, QueryParams } from 'src/types/common.type';
import { Topic } from '../entities/topic.entity';
import { FilterQuery } from 'mongoose';

export interface TopicsRepositoryInterface {
  findById(id: string): Promise<Topic>;
  create(createDto: any): Promise<Topic>;
  findAll();
  findOneByCondition(condition: FilterQuery<Topic>): Promise<Topic | null>;
  update(id: string, updateData: any): Promise<Topic | null>;
  delete(id: string): Promise<Topic | null>;
  countTotalViews(): Promise<number>;
}
