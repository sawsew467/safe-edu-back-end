import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { SignUpLink } from '@modules/organizations/entities/signup-link.entity';
import { SignUpLinkRepositoryInterface } from '@modules/organizations/interfaces/signup-link.interface';

@Injectable()
export class SignUpLinkRepository implements SignUpLinkRepositoryInterface {
	constructor(
		@InjectModel(SignUpLink.name)
		private readonly signUpLinkModel: Model<SignUpLink>,
	) {}

	async create(data: Partial<SignUpLink>): Promise<SignUpLink> {
		try {
			const newSignUpLink = new this.signUpLinkModel(data);
			return await newSignUpLink.save();
		} catch (error) {
			throw new BadRequestException({
				statusCode: HttpStatus.BAD_REQUEST,
				message: 'Error creating signup link',
				details: error.message,
			});
		}
	}

	async findOne(
		condition: FilterQuery<SignUpLink>,
	): Promise<SignUpLink | null> {
		return await this.signUpLinkModel
			.findOne(condition)
			.exec();
	}

	async findById(id: string): Promise<SignUpLink | null> {
		return await this.signUpLinkModel
			.findById(id)
			.exec();
	}

	async findActiveByOrganizationId(
		organizationId: string,
	): Promise<SignUpLink[]> {
		const currentDate = new Date();
		return await this.signUpLinkModel
			.find({
				organization_id: organizationId,
				is_revoked: false,
				start_date: { $lte: currentDate },
				expiration_date: { $gte: currentDate },
				isActive: true,
			})
			.sort({ created_at: -1 })
			.exec();
	}

	async update(
		id: string,
		data: Partial<SignUpLink>,
	): Promise<SignUpLink | null> {
		return await this.signUpLinkModel
			.findByIdAndUpdate(id, data, { new: true })
			.exec();
	}

	async revokeToken(id: string, revokedBy?: string): Promise<SignUpLink | null> {
		return await this.signUpLinkModel
			.findByIdAndUpdate(
				id,
				{
					is_revoked: true,
					revoked_at: new Date(),
					revoked_by: revokedBy || null,
				},
				{ new: true },
			)
			.exec();
	}

	async findOverlappingActiveLinks(
		organizationId: string,
		startDate: Date,
		expirationDate: Date,
	): Promise<SignUpLink[]> {
		return await this.signUpLinkModel
			.find({
				organization_id: organizationId,
				is_revoked: false,
				isActive: true,
				$or: [
					{
						// New link starts during existing link period
						start_date: { $lte: startDate },
						expiration_date: { $gte: startDate },
					},
					{
						// New link ends during existing link period
						start_date: { $lte: expirationDate },
						expiration_date: { $gte: expirationDate },
					},
					{
						// Existing link is completely within new link period
						start_date: { $gte: startDate },
						expiration_date: { $lte: expirationDate },
					},
				],
			})
			.exec();
	}
}
