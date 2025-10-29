import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, ObjectId, Types } from 'mongoose';
import { OrganizationsRepositoryInterface } from '@modules/organizations/interfaces/organizations.interface';
import { Organization } from '@modules/organizations/entities/organization.entity';
import { Province } from '@modules/provinces/entities/province.entity';

@Injectable()
export class OrganizationsRepository
	implements OrganizationsRepositoryInterface
{
	constructor(
		@InjectModel(Organization.name)
		private readonly organizationModel: Model<Organization>,
		@InjectModel(Province.name) private readonly provinceModel: Model<Province>,
	) {}

	async findOne(
		condition: FilterQuery<Organization>,
	): Promise<Organization | null> {
		return await this.organizationModel
			.findOne(condition)
			.populate('province_id')
			.exec();
	}
	async create(data: Partial<Organization>): Promise<Organization> {
		try {
			const newOrganization = new this.organizationModel(data);
			return await newOrganization.save();
		} catch (error) {
			throw new BadRequestException({
				statusCode: HttpStatus.BAD_REQUEST,
				message: 'Error creating organization',
				details: error.message,
			});
		}
	}

	async findWithCondition(
		condition: FilterQuery<Organization>,
	): Promise<Organization[] | null> {
		return await this.organizationModel
			.find(condition)
			.populate('province_id')
			.exec();
	}

	async findAll() {
		const organizations = await this.organizationModel
			.find()
			.populate('province_id')
			.exec();

		const total = await this.organizationModel.countDocuments().exec();
		return { items: organizations, total };
	}

	async update(
		id: string,
		data: Partial<Organization>,
	): Promise<Organization | null> {
		return await this.organizationModel
			.findByIdAndUpdate(id, data, { new: true })
			.populate('province_id')
			.populate('manager_id')
			.exec();
	}

	async remove(id: string | Types.ObjectId): Promise<Organization | null> {
		const stringId = id instanceof Types.ObjectId ? id.toString() : id;
		return this.organizationModel
			.findByIdAndUpdate(
				stringId,
				{
					deleted_at: new Date(),
					isActive: false,
				},
				{ new: true },
			)
			.exec();
	}

	async findById(id: string): Promise<Organization | null> {
		return await this.organizationModel
			.findById(id)
			.populate('province_id')
			.populate('manager_id')
			.exec(); // Using Mongoose's findById method
	}

	async isNameExist(name: string, province: string) {
		if (this.organizationModel.exists({ name, province })) {
			return true;
		} else {
			return false;
		}
	}

	async findAllWithPaging(
		query: Record<string, any>,
		current: number = 1,
		pageSize: number = 10,
	) {
		const { sort, ...filters } = query;

		current = Number(current) || 1;
		pageSize = Number(pageSize) || 10;

		const totalItems = await this.organizationModel.countDocuments(filters);
		const totalPages = Math.ceil(totalItems / pageSize);
		const offset = (current - 1) * pageSize;

		const result = await this.organizationModel
			.find(filters)
			.limit(pageSize)
			.skip(offset)
			.sort(sort as any);

		return { items: result, totalPages };
	}

	async isNullOrEmpty(value: string | null | undefined): Promise<boolean> {
		return !value || (typeof value === 'string' && value.trim() === '');
	}

	async findAllIsActive() {
		const organizations = await this.organizationModel
			.find({ isActive: true, deleted_at: null, deleted_by: null })
			.exec();

		const total = await this.organizationModel
			.countDocuments({ isActive: true, deleted_at: null, deleted_by: null })
			.exec();
		return { items: organizations, total };
	}

	async setIsActive(id: string | Types.ObjectId): Promise<Organization | null> {
		const stringId = id instanceof Types.ObjectId ? id.toString() : id;
		return this.organizationModel.findByIdAndUpdate(
			stringId,
			{ isActive: true },
			{ new: true },
		);
	}

	async countAll(): Promise<number> {
		const total = await this.organizationModel
			.countDocuments({ isActive: true, deleted_at: null, deleted_by: null })
			.exec();

		return total;
	}

	async countOrganizationsByProvince(): Promise<any[]> {
		return this.provinceModel.aggregate([
			{
				$lookup: {
					from: 'organizations',
					localField: '_id',
					foreignField: 'province_id',
					as: 'organizations',
				},
			},
			{
				$project: {
					provinceName: '$name',
					count: { $size: '$organizations' },
				},
			},
			{
				$sort: { count: -1 },
			},
		]);
	}
}
