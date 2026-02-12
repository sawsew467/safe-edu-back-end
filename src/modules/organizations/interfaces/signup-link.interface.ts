import { SignUpLink } from '../entities/signup-link.entity';
import { FilterQuery } from 'mongoose';

export interface SignUpLinkRepositoryInterface {
	create(data: Partial<SignUpLink>): Promise<SignUpLink>;
	findOne(condition: FilterQuery<SignUpLink>): Promise<SignUpLink | null>;
	findById(id: string): Promise<SignUpLink | null>;
	findActiveByOrganizationId(organizationId: string): Promise<SignUpLink[]>;
	update(id: string, data: Partial<SignUpLink>): Promise<SignUpLink | null>;
	revokeToken(id: string, revokedBy?: string): Promise<SignUpLink | null>;
	findOverlappingActiveLinks(
		organizationId: string,
		startDate: Date,
		expirationDate: Date,
	): Promise<SignUpLink[]>;
}
