import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from './entities/category.entity';
import { AwsS3Service } from 'src/services/aws-s3.service';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoriesRepositoryInterface } from './interfaces/category.interface';
import { TopicsService } from '@modules/topic/topic.service';

@Injectable()
export class CategoryService {
  constructor(
    @Inject('CategoriesRepositoryInterface')
    private readonly categoriesRepository: CategoriesRepositoryInterface,
    private readonly awsS3Service: AwsS3Service,
    private readonly topicsService: TopicsService,
  ) { }

  async create(createDto: CreateCategoryDto): Promise<Category> {
    return this.categoriesRepository.create(createDto);
  }

  async update(
    id: string,
    updateDto: UpdateCategoryDto,
  ): Promise<Category> {
    const existingCategory = await this.findOne(id);


    return this.categoriesRepository.update(id, { ...updateDto });
  }

  async findAll() {
    return this.categoriesRepository.findAll();
  }

  async getTotalViews(): Promise<number> {
    return this.categoriesRepository.countTotalViews();
  }

  async increaseView(id: string) {
    const category = await this.categoriesRepository.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    category.view += 1;
    
    await this.topicsService.increaseViewTopic(category.topic_id._id.toString())
    await category.save();
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findOneByCondition({
      _id: id,
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async delete(id: string): Promise<Category> {
    return await this.categoriesRepository.update(id,
      { deleted_at: new Date(), isActive: 'false' });
  }
}
