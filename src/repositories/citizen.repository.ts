import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, Model, Types } from 'mongoose';
import { Citizen } from '@modules/citizens/entities/citizen.entity';
import { CitizensRepositoryInterface } from '@modules/citizens/interfaces/citizens.interfaces';
import * as moment from 'moment';

@Injectable()
export class CitizensRepository implements CitizensRepositoryInterface {
	constructor(
		@InjectModel(Citizen.name) private readonly Citizen_Model: Model<Citizen>,
	) {}
	async findOne(condition: FilterQuery<Citizen>): Promise<Citizen | null> {
		return await this.Citizen_Model.findOne(condition)
			.populate('province')
			.exec();
	}

	async create(data: Partial<Citizen>): Promise<Citizen> {
		console.log('data:', JSON.stringify(data, null, 2));

		try {
			const newCitizen = new this.Citizen_Model(data);
			const savedCitizen = await newCitizen.save();
			return savedCitizen;
		} catch (error) {
			console.error('Error saving new Citizen:', error.message);
			throw new BadRequestException(
				'Failed to create Citizen. Please try again.',
			);
		}
	}

	async findByOrgId(organizationId: string): Promise<Citizen[]> {
		try {
			const orgId = mongoose.Types.ObjectId.isValid(organizationId)
				? new mongoose.Types.ObjectId(organizationId)
				: null;

			if (!orgId) {
				throw new BadRequestException({
					status: HttpStatus.BAD_REQUEST,
					message: 'organizationId không hợp lệ',
				});
			}

			const citizens = await this.Citizen_Model.find({
				organizationId: { $in: [orgId] }, // organizationId là mảng
				isActive: true,
				deleted_at: null,
			});

			return citizens;
		} catch (error) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message: 'Lỗi khi tìm công dân theo tổ chức.',
				details: error.message,
			});
		}
	}

	async findAll(
		searchPhase: string = '',
		page: number = 1,
		limit: number = 10,
		sortBy: string = 'createdAt',
		sortOrder: 'asc' | 'desc' = 'asc',
	): Promise<any> {
		const filter: any = {};

		if (searchPhase) {
			filter.$or = [
				{ companyName: new RegExp(searchPhase, 'i') },
				{ description: new RegExp(searchPhase, 'i') },
			];
		}

		const validPage = Number(page) > 0 ? Number(page) : 1;
		const validLimit = Number(limit) > 0 ? Number(limit) : 10;
		const skip = (validPage - 1) * validLimit;
		const sortDirection = sortOrder === 'asc' ? 1 : -1;

		const companies = await this.Citizen_Model.find(filter)
			.skip(skip)
			.limit(validLimit)
			.populate('province')
			.sort({ [sortBy]: sortDirection })
			.exec();

		const totalItemCount =
			await this.Citizen_Model.countDocuments(filter).exec();
		const totalPages =
			totalItemCount > 0 ? Math.ceil(totalItemCount / validLimit) : 1;
		const itemFrom = totalItemCount === 0 ? 0 : skip + 1;
		const itemTo = Math.min(skip + validLimit, totalItemCount);

		const response = {
			items: companies,
			totalItemCount: totalItemCount,
			totalPages: totalPages,
			itemFrom: itemFrom,
			itemTo: itemTo,
		};

		return response;
	}

	async getCitizenWithRole(CitizenId: string): Promise<Citizen | null> {
		return await this.Citizen_Model.findById(CitizenId)
			.populate('province')
			.populate('role')
			.exec();
	}

	async update(id: string, data: Partial<Citizen>): Promise<Citizen | null> {
		return await this.Citizen_Model.findByIdAndUpdate(id, data, {
			new: true,
		}).exec();
	}

	async remove(id: string): Promise<boolean> {
		const result = await this.Citizen_Model.findByIdAndDelete(id).exec();
		return !!result;
	}

	async findOneByCondition(
		condition: FilterQuery<Citizen>,
	): Promise<Citizen | null> {
		try {
			const citizen = await this.Citizen_Model.findOne(condition).exec();
			return citizen;
		} catch (error) {
			console.error('Error finding student:', error);
			throw error;
		}
	}

	async delete(id: string | Types.ObjectId): Promise<Citizen | null> {
		const stringId = id instanceof Types.ObjectId ? id.toString() : id;
		return this.Citizen_Model.findByIdAndUpdate(
			stringId,
			{ deleted_at: new Date(), isActive: false },
			{ new: true },
		).exec();
	}

	async countAllCitizens() {
		const total = await this.Citizen_Model.countDocuments().exec();

		const startOfMonth = moment().startOf('month').toDate();
		const endOfMonth = moment().endOf('month').toDate();

		const monthlyRegistered = await this.Citizen_Model.countDocuments({
			created_at: { $gte: startOfMonth, $lte: endOfMonth },
		});

		return {
			total,
			monthlyRegistered,
		};
	}
}
