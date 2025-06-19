import { Admin } from '@modules/admin/entities/admin.entity';
import { AdminRepositoryInterface } from '@modules/admin/interfaces/admin.interface';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';


@Injectable()
export class AdminRepository implements AdminRepositoryInterface {
	constructor(
		@InjectModel(Admin.name) private readonly AdminModel: Model<Admin>,
	) {}
	async findOne(condition: FilterQuery<Admin>): Promise<Admin | null> {
		return await this.AdminModel.findOne(condition).exec(); 
	  }
	async create(data: Partial<Admin>): Promise<Admin> {
		console.log('data:', JSON.stringify(data, null, 2));
		
		try {
			const newAdmin = new this.AdminModel(data);
			const savedAdmin = await newAdmin.save();
			return savedAdmin;
		  } catch (error) {
			console.error('Error saving new Admin:', error.message);
		  
			// Tùy chỉnh lỗi phản hồi
			throw new BadRequestException('Failed to create Admin. Please try again.');
		  }
	}
	async findAll() {
		const Admins = await this.AdminModel
		  .find()
		  .exec(); 
	  
		const total = await this.AdminModel.countDocuments().exec();
		return { items: Admins, total };
	  }
	  
	  

	async getAdminWithRole(AdminId: string): Promise<Admin | null> {
		return await this.AdminModel.findById(AdminId).populate('role').exec();
	}

	async update(id: string, data: Partial<Admin>): Promise<Admin | null> {
		return await this.AdminModel.findByIdAndUpdate(id, data, { new: true }).exec();
	}

	async remove(id: string): Promise<boolean> {
		const result = await this.AdminModel.findByIdAndDelete(id).exec();
		return !!result;
	}

	async findById(id: string): Promise<Admin | null> {
		return await this.AdminModel.findById(id).exec(); // Using Mongoose's findById method
	  }
}
