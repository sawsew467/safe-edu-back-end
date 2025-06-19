import { BadRequestException, Inject, Injectable, NotFoundException, Delete } from '@nestjs/common';
import { CreateNewDto } from './dto/create-new.dto';
import { UpdateNewDto } from './dto/update-new.dto';
import { NewsRepository } from '@repositories/news.repository';
import { News } from './entities/news.entity';
import mongoose from 'mongoose';
import { AwsS3Service } from 'src/services/aws-s3.service';
import { TopicsRepository } from '@repositories/topic.repository';
import { TopicsService } from '@modules/topic/topic.service';
import { NewsRepositoryInterface } from './interfaces/news.interfaces';
import { TopicsRepositoryInterface } from '@modules/topic/interfaces/topic.interface';
import { ERRORS_DICTIONARY } from 'src/constraints/error-dictionary.constraint';

@Injectable()
export class NewService {
  constructor(
    @Inject('NewsRepositoryInterface')
    private readonly news_repository: NewsRepositoryInterface,
    @Inject('TopicsRepositoryInterface')
    private readonly topics_repository: TopicsRepositoryInterface,
    private readonly topic_service: TopicsService,
  ) {}

  async create(createNewDto: CreateNewDto): Promise<News>{
    const {topic_id, title, content, image, author} = createNewDto;
    const existed_topic = await this.topics_repository.findOneByCondition({_id: topic_id});
    
    if (existed_topic == null) {
      throw new BadRequestException({
        message: ERRORS_DICTIONARY.TOPIC_NOT_FOUND,
        details: "Topic not found"       
      })
    }

    const news = await this.news_repository.create({
      topic_id: new mongoose.Types.ObjectId(topic_id),
      title,
      content, 
      image,
      author
    });
    return this.news_repository.findOne(news);
  }

  async findAll() {
    return await this.news_repository.findAll();
  }

  async findOneById(id: string) {
    if (mongoose.isValidObjectId(id)) {
      return await this.news_repository.findById(id);
    } else {
      throw new BadRequestException("Invalid id");
    }
  }

  async update(id: string, 
    updateDto: UpdateNewDto
  ): Promise<News> {
    const updatedNews = await this.findOneById(id);
    // Handle image upload if 
    // 
    // a new file is provided
    return this.news_repository.update(id, {...updateDto});
  }

  async remove(id: string) {
    //check id 
    if (mongoose.isValidObjectId(id)) {
      return await this.news_repository.remove(id);
    } else {
      throw new BadRequestException("Invalid Id")
    }
  }

  async delete(id: string): Promise<News> {
      return await this.news_repository.update(id, {
        deleted_at: new Date(),
        isActive: false
      });
  }

  async setIsActiveTrue(id: string):Promise<News> {
    return await this.news_repository.update(id, {
        isActive: true,
    })
  }

  async getTotalViews(): Promise<number> {
    return this.news_repository.countTotalViews();
  }

  async increaseView(id: string) {
    const news = await this.news_repository.findById(id);
    if (!news) {
      throw new NotFoundException('News not found');
    }
    news.view += 1;
    await this.topic_service.increaseViewTopic(news.topic_id._id.toString())
    await news.save();
  }
}
