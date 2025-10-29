import { FilterQuery, Types } from 'mongoose';
import { EmergencyContact } from '../entities/emergency-contact.entity';

export interface EmergencyContactRepositoryInterface {
	create(data: Partial<EmergencyContact>): Promise<EmergencyContact>;
	findById(id: string | Types.ObjectId): Promise<EmergencyContact | null>;
	findOne(condition: FilterQuery<EmergencyContact>): Promise<EmergencyContact | null>;
	findByOrganization(
		organizationId: string | Types.ObjectId,
	): Promise<EmergencyContact[]>;
	findByOrganizationOrGlobal(
		organizationId: string | Types.ObjectId,
	): Promise<EmergencyContact[]>;
	findGlobalContacts(): Promise<EmergencyContact[]>;
	findAll(
		filter?: FilterQuery<EmergencyContact>,
		skip?: number,
		limit?: number,
	): Promise<{ items: EmergencyContact[]; total: number }>;
	count(filter?: FilterQuery<EmergencyContact>): Promise<number>;
	update(id: string | Types.ObjectId, data: Partial<EmergencyContact>): Promise<EmergencyContact | null>;
	delete(id: string | Types.ObjectId): Promise<EmergencyContact | null>;
}
