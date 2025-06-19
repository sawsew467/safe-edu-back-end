import { FilterQuery } from 'mongoose';
import { News } from '../entities/news.entity';

export interface NewsRepositoryInterface {
	create(createDto: any): Promise<News>;
	findAll();
	update(id: string, data: any): Promise<News | null>;
	remove(id: string): Promise<boolean>;
	findOne(condition: FilterQuery<News>): Promise<News | null>;  
	findById(id : string)
	countTotalViews(): Promise<number>;
}