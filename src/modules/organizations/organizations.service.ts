import {
	BadRequestException,
	ConflictException,
	HttpStatus,
	Inject,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { Organization } from './entities/organization.entity';
import mongoose, { FilterQuery, Types } from 'mongoose';
import { OrganizationsRepositoryInterface } from '@modules/organizations/interfaces/organizations.interface';
import { ERRORS_DICTIONARY } from 'src/constraints/error-dictionary.constraint';
import { ManagerRepositoryInterface } from '@modules/manager/interfaces/manager.interface';
import { stat } from 'fs';
import { GenerateLinkSignUpDTO } from './dto/generate-link-sign-up.dto';
import { JwtService } from '@nestjs/jwt';
import { access_token_private_key } from 'src/constraints/jwt.constraint';
import { SignUpLinkRepositoryInterface } from '@modules/organizations/interfaces/signup-link.interface';
import { SignUpLink } from './entities/signup-link.entity';

@Injectable()
export class OrganizationsService {
	constructor(
		@Inject('OrganizationsRepositoryInterface')
		private readonly organizations_repository: OrganizationsRepositoryInterface,
		@Inject('ManagerRepositoryInterface')
		private readonly manager_repository: ManagerRepositoryInterface,
		@Inject('SignUpLinkRepositoryInterface')
		private readonly signup_link_repository: SignUpLinkRepositoryInterface,
	) {}

	async create(create_dto: CreateOrganizationDto): Promise<Organization> {
		try {
			const { name, province_id, slug } = create_dto;
			const existed_organization = await this.organizations_repository.findOne({
				name,
				province_id,
			});
			const existed_slug = await this.organizations_repository.findOne({
				slug,
			});

			if (existed_organization) {
				throw new BadRequestException({
					message: ERRORS_DICTIONARY.ORGANIZATION_NAME_EXISTS,
					details: 'Organization already existed!!',
				});
			}

			if (existed_slug) {
				throw new BadRequestException({
					message: ERRORS_DICTIONARY.ORGANIZATION_SLUG_ALREADY_EXIST,
					details: 'Slug already existed!!',
				});
			}

			const organization = await this.organizations_repository.create({
				...create_dto,
				province_id: new mongoose.Types.ObjectId(province_id),
			});

			return this.organizations_repository.findOne(organization);
		} catch (error) {
			throw new BadRequestException({
				statusCode: HttpStatus.BAD_REQUEST,
				message: error.message,
				details:
					'Đã có lỗi xảy ra trong quá trình tạo tổ chức, vui lòng thử lại sau!',
			});
		}
	}

	async findAll() {
		return await this.organizations_repository.findAll();
	}

	async findOneById(id: string): Promise<Organization> {
		return await this.organizations_repository.findById(id);
	}

	async getOrganizationCountByProvince() {
		return this.organizations_repository.countOrganizationsByProvince();
	}
	async findWithCondition(
		condition: FilterQuery<Organization>,
	): Promise<Organization[] | null> {
		return this.organizations_repository.findWithCondition(condition);
	}

	async update(
		id: string,
		updateOrganizationDto: UpdateOrganizationDto,
	): Promise<Organization> {
		const updatedOrganization = await this.organizations_repository.update(id, {
			...updateOrganizationDto,
			province_id: updateOrganizationDto.province_id
				? new mongoose.Types.ObjectId(updateOrganizationDto.province_id)
				: undefined,
		});
		if (!updatedOrganization) {
			throw new NotFoundException(`Trường cần tìm không tồn tại: ${id}`);
		}
		return updatedOrganization;
	}

	async remove(_id: string) {
		if (mongoose.isValidObjectId(_id)) {
			return await this.organizations_repository.remove(_id);
		} else {
			throw new BadRequestException('Invalid Id');
		}
	}

	async setIsActiveTrue(id: string) {
		return await this.organizations_repository.setIsActive(id);
	}

	async assignOneManager(managerId: string, organizationId: string) {
		try {
			const existed_manager = await this.manager_repository.findById(managerId);
			const existed_organization =
				await this.organizations_repository.findById(organizationId);
			if (!existed_manager) {
				throw new BadRequestException({
					status: HttpStatus.BAD_REQUEST,
					message: `Quản lí với ID: ${managerId} không tồn tại`,
				});
			}

			if (!existed_organization) {
				throw new BadRequestException({
					status: HttpStatus.BAD_REQUEST,
					message: `Tổ chức với ID: ${organizationId} không tồn tại`,
				});
			}

			await this.organizations_repository.update(organizationId, {
				manager_id: existed_manager,
			});

			await this.manager_repository.update(managerId, {
				organizationId: existed_organization,
			});

			return await this.organizations_repository.findOne({ organizationId });
		} catch (error) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message:
					'Đã có lỗi xảy ra khi cập nhật quản lí cho tổ chức, vui lòng thử lại sau',
				details: `Đã có lỗi xảy ra: ${error.message}`,
			});
		}
	}

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

	async countAllOrganizations(): Promise<number> {
		return this.organizations_repository.countAll();
	}

	async getActiveSignUpLinks(organizationId: string): Promise<SignUpLink[]> {
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
}
