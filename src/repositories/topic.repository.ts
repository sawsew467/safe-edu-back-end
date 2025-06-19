import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, Types } from 'mongoose';
import { FindAllResponse, QueryParams } from 'src/types/common.type';
import { Topic, TopicDocument } from '@modules/topic/entities/topic.entity';
import { TopicsRepositoryInterface } from '@modules/topic/interfaces/topic.interface';

@Injectable()
export class TopicsRepository implements TopicsRepositoryInterface {
  constructor(
    @InjectModel(Topic.name)
    private readonly topic_model: Model<TopicDocument>,
  ) { }
  async create(createDto: any): Promise<Topic> {
    const createdTopic = new this.topic_model(createDto);
    return createdTopic.save(); // Save the new topic and return the saved document
  }
  // The findAll method to fetch all topics with optional pagination
  async findAll() {

    const topics = await this.topic_model
      .find()
      .exec();

    return {
      data: topics,

    };
  }
  async findById(id: string): Promise<Topic> {
    return this.topic_model.findById(id).exec();
  }

  // Find one topic by condition
  async findOneByCondition(condition: FilterQuery<Topic>): Promise<Topic | null> {
    return this.topic_model.findOne(condition).exec();
  }

  // Update topic by ID
  async update(id: string | Types.ObjectId, updateData: any): Promise<Topic | null> {
    const stringId = id instanceof Types.ObjectId ? id.toString() : id;
    return this.topic_model.findByIdAndUpdate(stringId, updateData, { new: true }).exec();
  }

  // Soft delete topic by ID (mark as deleted)
  async delete(id: string | Types.ObjectId): Promise<Topic | null> {
    const stringId = id instanceof Types.ObjectId ? id.toString() : id;
    return this.topic_model.findByIdAndUpdate(stringId, { deleted_at: new Date() }, { new: true }).exec();
  }


  async countTotalViews(): Promise<number> {
    const result = await this.topic_model.aggregate([
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
