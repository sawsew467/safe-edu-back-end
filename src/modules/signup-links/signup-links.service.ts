import {
	BadRequestException,
	HttpStatus,
	Inject,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import mongoose from 'mongoose';
import { GenerateLinkSignUpDTO } from './dto/generate-link-sign-up.dto';
import { SignUpLinkRepositoryInterface } from '@modules/signup-links/interfaces/signup-link.interface';
import { SignUpLink } from './entities/signup-link.entity';
import { OrganizationsRepositoryInterface } from '@modules/organizations/interfaces/organizations.interface';

@Injectable()
export class SignupLinksService {
	constructor(
		@Inject('SignUpLinkRepositoryInterface')
		private readonly signup_link_repository: SignUpLinkRepositoryInterface,
		@Inject('OrganizationsRepositoryInterface')
		private readonly organizations_repository: OrganizationsRepositoryInterface,
	) {}

	async generateLinkSignUp(
		organizationId: string,
		generateLinkSignUpDto: GenerateLinkSignUpDTO,
	): Promise<SignUpLink> {
		if (!organizationId) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message: 'OrganizationId is required',
			});
		}
		const { startDate = new Date(), expirationDate } = generateLinkSignUpDto;

		if (startDate && expirationDate && startDate >= expirationDate) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message: 'Expiration date must be after start date',
			});
		}

		const organization =
			await this.organizations_repository.findById(organizationId);

		if (!organization) {
			throw new NotFoundException({
				status: HttpStatus.NOT_FOUND,
				message: `Organization with id ${organizationId} not found`,
			});
		}

		// Check for overlapping active links
		const overlappingLinks =
			await this.signup_link_repository.findOverlappingActiveLinks(
				organizationId,
				startDate,
				expirationDate,
			);

		if (overlappingLinks.length > 0) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message:
					'Không thể tạo link mới vì đã tồn tại link đang hoạt động trong khoảng thời gian này',
				details:
					'Vui lòng kiểm tra lại khoảng thời gian bắt đầu và kết thúc của link đăng ký.',
			});
		}

		// Save signup link to database
		const signUpLink = await this.signup_link_repository.create({
			organization_id: new mongoose.Types.ObjectId(organizationId),
			start_date: startDate,
			expiration_date: expirationDate,
			is_revoked: false,
		});

		return signUpLink;
	}

	async getActiveOrganizationSignUpLinks(
		organizationId: string,
	): Promise<SignUpLink[]> {
		if (!organizationId) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message: 'OrganizationId is required',
			});
		}

		const organization =
			await this.organizations_repository.findById(organizationId);

		if (!organization) {
			throw new NotFoundException({
				status: HttpStatus.NOT_FOUND,
				message: `Organization with id ${organizationId} not found`,
			});
		}

		return this.signup_link_repository.findActiveByOrganizationId(
			organizationId,
		);
	}

	async revokeSignUpLink(
		linkId: string,
		revokedBy?: string,
	): Promise<SignUpLink> {
		if (!linkId) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message: 'LinkId is required',
			});
		}

		const signUpLink = await this.signup_link_repository.findById(linkId);

		if (!signUpLink) {
			throw new NotFoundException({
				status: HttpStatus.NOT_FOUND,
				message: `Sign up link with id ${linkId} not found`,
			});
		}

		if (signUpLink.is_revoked) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message: 'Sign up link is already revoked',
			});
		}

		const revokedLink = await this.signup_link_repository.revokeToken(
			linkId,
			revokedBy,
		);

		if (!revokedLink) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message: 'Failed to revoke sign up link',
			});
		}

		return revokedLink;
	}

	async getSignUpLinkDetail(linkId: string): Promise<SignUpLink> {
		if (!linkId) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message: 'LinkId is required',
			});
		}

		const signUpLink = await this.signup_link_repository.findById(linkId);

		if (!signUpLink) {
			throw new NotFoundException({
				status: HttpStatus.NOT_FOUND,
				message: `Sign up link with id ${linkId} not found`,
			});
		}

		return signUpLink;
	}

	async validateSignUpLink(id: string): Promise<{
		isValid: boolean;
		organizationId?: string;
		message: string;
	}> {
		if (!id) {
			return {
				isValid: false,
				message: 'Token is required',
			};
		}

		const signUpLink = await this.signup_link_repository.findById(id);

		if (!signUpLink) {
			return {
				isValid: false,
				message: 'Sign-up link not found',
			};
		}

		if (signUpLink.is_revoked) {
			return {
				isValid: false,
				message: 'Sign-up link has been revoked',
			};
		}

		const currentDate = new Date();

		if (currentDate < signUpLink.start_date) {
			return {
				isValid: false,
				message: 'Sign-up link is not active yet',
			};
		}

		if (currentDate > signUpLink.expiration_date) {
			return {
				isValid: false,
				message: 'Sign-up link has expired',
			};
		}

		if (!signUpLink.isActive) {
			return {
				isValid: false,
				message: 'Sign-up link is not active',
			};
		}

		const organizationId = signUpLink.organization_id?.toString();

		return {
			isValid: true,
			organizationId,
			message: 'Sign-up link is valid',
		};
	}

	async generateLinkSignUpForAdmin(
		organizationId: string,
		startDate: Date,
		expirationDate: Date,
	): Promise<SignUpLink> {
		if (!organizationId) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message: 'OrganizationId is required',
			});
		}

		const resolvedStartDate = startDate || new Date();

		if (!expirationDate) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message: 'Expiration date is required',
			});
		}

		if (resolvedStartDate >= expirationDate) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message: 'Expiration date must be after start date',
			});
		}

		const organization =
			await this.organizations_repository.findById(organizationId);

		if (!organization) {
			throw new NotFoundException({
				status: HttpStatus.NOT_FOUND,
				message: `Organization with id ${organizationId} not found`,
			});
		}

		// Check for overlapping active links
		const overlappingLinks =
			await this.signup_link_repository.findOverlappingActiveLinks(
				organizationId,
				resolvedStartDate,
				expirationDate,
                true
			);

		if (overlappingLinks.length > 0) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message:
					'Không thể tạo link mới vì đã tồn tại link đang hoạt động trong khoảng thời gian này',
				details:
					'Vui lòng kiểm tra lại khoảng thời gian bắt đầu và kết thúc của link đăng ký.',
			});
		}

		// Save signup link to database
		const signUpLink = await this.signup_link_repository.create({
			organization_id: new mongoose.Types.ObjectId(organizationId),
			start_date: resolvedStartDate,
			expiration_date: expirationDate,
			is_revoked: false,
			created_by_admin: true,
		});

		return signUpLink;
	}

	async getAdminSignUpLinks(organizationId?: string): Promise<SignUpLink[]> {
		const filter: any = {};
		filter.created_by_admin = true;

		if (organizationId) {
			filter.organization_id = organizationId;
		}

		return await this.signup_link_repository.findWithCondition(filter);
	}
}
