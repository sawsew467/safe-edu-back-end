import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { EmergencyContact } from '@modules/school-violence-reports/entities/emergency-contact.entity';
import { EmergencyContactRepositoryInterface } from '@modules/school-violence-reports/interfaces/emergency-contact-repository.interface';

@Injectable()
export class EmergencyContactRepository
	implements EmergencyContactRepositoryInterface
{
	constructor(
		@InjectModel(EmergencyContact.name)
		private readonly emergencyContactModel: Model<EmergencyContact>,
	) {}

	async create(data: Partial<EmergencyContact>): Promise<EmergencyContact> {
		const newContact = new this.emergencyContactModel(data);
		return await newContact.save();
	}

	async findById(
		id: string | Types.ObjectId,
	): Promise<EmergencyContact | null> {
		const stringId = id instanceof Types.ObjectId ? id.toString() : id;
		return await this.emergencyContactModel
			.findById(stringId)
			.populate('organizationId')
			.exec();
	}

	async findOne(
		condition: FilterQuery<EmergencyContact>,
	): Promise<EmergencyContact | null> {
		return await this.emergencyContactModel
			.findOne(condition)
			.populate('organizationId')
			.exec();
	}

	async findAll(
		filter: FilterQuery<EmergencyContact> = {},
		skip: number = 0,
		limit: number = 10,
	): Promise<{ items: EmergencyContact[]; total: number }> {
		const activeFilter = { ...filter, isActive: true };
		const items = await this.emergencyContactModel
			.find(activeFilter)
			.populate('organizationId')
			.sort({ created_at: -1 })
			.skip(skip)
			.limit(limit)
			.exec();

		const total = await this.emergencyContactModel
			.countDocuments(activeFilter)
			.exec();

		return { items, total };
	}

	async findByOrganization(
		organizationId: string | Types.ObjectId,
	): Promise<EmergencyContact[]> {
		const orgId =
			typeof organizationId === 'string'
				? new Types.ObjectId(organizationId)
				: organizationId;
		return await this.emergencyContactModel
			.find({ organizationId: orgId, isActive: true })
			.populate('organizationId')
			.exec();
	}
	async findByOrganizationOrGlobal(
		organizationId: string | Types.ObjectId,
	): Promise<EmergencyContact[]> {
		const orgId =
			typeof organizationId === 'string'
				? new Types.ObjectId(organizationId)
				: organizationId;
		return await this.emergencyContactModel
			.find({
				$and: [
					{ $or: [{ organizationId: orgId }, { organizationId: null }] },
					{ isActive: true }
				]
			})
			.populate('organizationId')
			.exec();
	}

	async findGlobalContacts(): Promise<EmergencyContact[]> {
		return await this.emergencyContactModel
			.find({
				$and: [
					{ $or: [{ organizationId: null }, { organizationId: { $exists: false } }] },
					{ isActive: true }
				]
			})
			.sort({ created_at: -1 })
			.exec();
	}

	async count(filter: FilterQuery<EmergencyContact> = {}): Promise<number> {
		return await this.emergencyContactModel.countDocuments(filter).exec();
	}

	async update(
		id: string | Types.ObjectId,
		data: Partial<EmergencyContact>,
	): Promise<EmergencyContact | null> {
		const stringId = id instanceof Types.ObjectId ? id.toString() : id;
		return await this.emergencyContactModel
			.findByIdAndUpdate(stringId, data, { new: true })
			.populate('organizationId')
			.exec();
	}

	async delete(
		id: string | Types.ObjectId,
	): Promise<EmergencyContact | null> {
		const stringId = id instanceof Types.ObjectId ? id.toString() : id;
		return await this.emergencyContactModel
			.findByIdAndUpdate(stringId, { isActive: false }, { new: true })
			.populate('organizationId')
			.exec();
	}
}
