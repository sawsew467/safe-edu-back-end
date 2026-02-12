import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	BadRequestException,
	HttpStatus,
	UseGuards,
	Req,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Organization } from './entities/organization.entity';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { JwtAccessTokenGuard } from '@modules/auth/guards/jwt-access-token.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesEnum } from 'src/enums/roles..enum';
import { GenerateLinkSignUpDTO } from './dto/generate-link-sign-up.dto';
import { ValidateSignUpLinkResponseDto } from './dto/validate-signup-link-response.dto';

@Controller('organizations')
@ApiTags('organizations')
@ApiBearerAuth('token')
export class OrganizationsController {
	constructor(private readonly organizationsService: OrganizationsService) {}

	@Roles(RolesEnum.ADMIN)
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	@Post()
	@ApiOperation({ summary: 'Create a new organization' })
	async create(
		@Body() createOrganizationDto: CreateOrganizationDto,
	): Promise<Organization> {
		return await this.organizationsService.create(createOrganizationDto);
	}

	@Get()
	@ApiOperation({ summary: 'Retrive all organizations' })
	async findAll() {
		return await this.organizationsService.findAll();
	}

	@Get('total')
	@ApiOperation({ summary: 'Đếm số lượng tổ chức hiện có' })
	async countAll() {
		const total = await this.organizationsService.countAllOrganizations();
		return total;
	}

	@Get('count-by-province')
	async getCountByProvince() {
		return this.organizationsService.getOrganizationCountByProvince();
	}

	@Get(':id')
	@ApiOperation({ summary: 'Retrive a organization by id' })
	async findOne(@Param('id') id: string): Promise<Organization> {
		return await this.organizationsService.findOneById(id);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update a organization by ID' })
	async update(
		@Param('id') id: string,
		@Body() updateOrganizationDto: UpdateOrganizationDto,
	): Promise<Organization> {
		return await this.organizationsService.update(id, updateOrganizationDto);
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Delete a organization by ID' })
	async remove(@Param('id') id: string): Promise<void> {
		await this.organizationsService.remove(id);
	}

	@Patch('isActive/:id')
	@ApiOperation({ summary: 'Update isActive true' })
	async setIsActiveTrue(@Param('id') id: string) {
		return await this.organizationsService.setIsActiveTrue(id);
	}

	@Patch('assign-manager/:id')
	@ApiOperation({ summary: 'Assign manager to organization' })
	async assignManager(
		@Param('id') organizationId: string,
		@Body('managerId') managerId: string,
	) {
		return await this.organizationsService.assignOneManager(
			managerId,
			organizationId,
		);
	}

	@Post('generate-link-sign-up')
	@Roles(RolesEnum.MANAGER)
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	@ApiOperation({ summary: 'Generate sign-up link for organization' })
	async generateLinkSignUp(
		@Req() req,
		@Body() generateLinkSignUpDto: GenerateLinkSignUpDTO,
	) {
		return await this.organizationsService.generateLinkSignUp(
			req?.user?.organizationId,
			generateLinkSignUpDto,
		);
	}

	@Get('signup-links/active')
	@Roles(RolesEnum.MANAGER)
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	@ApiOperation({ summary: 'Get all active sign-up links for organization' })
	async getActiveSignUpLinks(@Req() req) {
		return await this.organizationsService.getActiveSignUpLinks(
			req?.user?.organizationId,
		);
	}

	@Get('signup-links/:linkId')
	@Roles(RolesEnum.MANAGER)
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	@ApiOperation({ summary: 'Get sign-up link detail' })
	async getSignUpLinkDetail(@Param('linkId') linkId: string) {
		return await this.organizationsService.getSignUpLinkDetail(linkId);
	}

	@Patch('signup-links/:linkId/revoke')
	@Roles(RolesEnum.MANAGER)
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	@ApiOperation({ summary: 'Revoke a sign-up link' })
	async revokeSignUpLink(@Param('linkId') linkId: string, @Req() req) {
		return await this.organizationsService.revokeSignUpLink(
			linkId,
			req?.user?.id,
		);
	}

	@Get('validate-signup-link/:id')
	@ApiOperation({ 
		summary: 'Validate sign-up link for user registration (public endpoint)',
		description: 'Validates if the signup link is valid and returns organization information'
	})
	async validateSignUpLink(
		@Param('id') id: string,
	): Promise<ValidateSignUpLinkResponseDto> {
		return await this.organizationsService.validateSignUpLink(id);
	}
}
