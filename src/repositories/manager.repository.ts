import { Manager } from '@modules/manager/entities/manager.entity';
import { ManagerRepositoryInterface } from '@modules/manager/interfaces/manager.interface';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { resourceUsage } from 'node:process';


@Injectable()
export class ManagerRepository implements ManagerRepositoryInterface {
	constructor(
		@InjectModel(Manager.name) private readonly ManagerModel: Model<Manager>,
	) { }
	async findOne(condition: FilterQuery<Manager>): Promise<Manager | null> {
		return await this.ManagerModel.findOne(condition)
			.populate('organizationId')
			.exec();
	}
	async create(data: Partial<Manager>): Promise<Manager> {
		try {
			const newManager = new this.ManagerModel(data);
			const savedManager = await newManager.save();
			return savedManager;
		} catch (error) {
			console.error('Error saving new Manager:', error.message);

			// Tùy chỉnh lỗi phản hồi
			throw new BadRequestException('Failed to create Manager. Please try again.');
		}
	}
	async findAll() {
		const Managers = await this.ManagerModel
			.find()
			.populate('organizationId')
			.exec();
		const total = await this.ManagerModel.countDocuments().exec();
		return { items: Managers, total };
	}



	async getManagerWithRole(ManagerId: string): Promise<Manager | null> {
		return await this.ManagerModel.findById(ManagerId).populate('role').exec();
	}

	async update(id: string, data: Partial<Manager>): Promise<Manager | null> {
		return await this.ManagerModel.findByIdAndUpdate(id, data, { new: true }).exec();
	}

	async remove(id: string): Promise<boolean> {
		const result = await this.ManagerModel.findByIdAndDelete(id).exec();
		return !!result;
	}

	async findById(id: string): Promise<Manager | null> {
		return await this.ManagerModel.findById(id)
		.populate('organizationId')
		.exec(); // Using Mongoose's findById method
	}

	async findOneByCondition(condition: FilterQuery<Manager>): Promise<Manager | null> {
		try {
			const manager = await this.ManagerModel.findOne(condition).populate('organizationId').exec();
			return manager;
		} catch (error) {
			console.error('Error finding manager:', error)
			throw error;
		}	
	}
}
