import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	UseGuards,
	Req,
	Query,
} from '@nestjs/common';
import { SignupLinksService } from './signup-links.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { JwtAccessTokenGuard } from '@modules/auth/guards/jwt-access-token.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesEnum } from 'src/enums/roles..enum';
import { GenerateLinkSignUpDTO } from './dto/generate-link-sign-up.dto';
import { ValidateSignUpLinkResponseDto } from './dto/validate-signup-link-response.dto';
import { AdminCreateSignUpLinkDto } from './dto/admin-create-signup-link.dto';

@Controller('signup-links')
@ApiTags('signup-links')
@ApiBearerAuth('token')
export class SignupLinksController {
	constructor(private readonly signupLinksService: SignupLinksService) {}

	@Post('generate-link-sign-up')
	@Roles(RolesEnum.MANAGER)
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	@ApiOperation({ summary: 'Generate sign-up link for organization' })
	async generateLinkSignUp(
		@Req() req,
		@Body() generateLinkSignUpDto: GenerateLinkSignUpDTO,
	) {
		return await this.signupLinksService.generateLinkSignUp(
			req?.user?.organizationId,
			generateLinkSignUpDto,
		);
	}

	@Get('active')
	@Roles(RolesEnum.MANAGER)
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	@ApiOperation({ summary: 'Get all active sign-up links for organization' })
	async getActiveSignUpLinks(@Req() req) {
		return await this.signupLinksService.getActiveOrganizationSignUpLinks(
			req?.user?.organizationId,
		);
	}

	@Get('validate/:id')
	@ApiOperation({
		summary: 'Validate sign-up link for user registration (public endpoint)',
		description:
			'Validates if the signup link is valid and returns organization information',
	})
	async validateSignUpLink(
		@Param('id') id: string,
	): Promise<ValidateSignUpLinkResponseDto> {
		return await this.signupLinksService.validateSignUpLink(id);
	}

	@Get(':linkId')
	@Roles(RolesEnum.MANAGER, RolesEnum.ADMIN)
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	@ApiOperation({ summary: 'Get sign-up link detail' })
	async getSignUpLinkDetail(@Param('linkId') linkId: string) {
		return await this.signupLinksService.getSignUpLinkDetail(linkId);
	}

	@Patch(':linkId/revoke')
	@Roles(RolesEnum.MANAGER, RolesEnum.ADMIN)
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	@ApiOperation({ summary: 'Revoke a sign-up link' })
	async revokeSignUpLink(@Param('linkId') linkId: string, @Req() req) {
		return await this.signupLinksService.revokeSignUpLink(
			linkId,
			req?.user?.id,
		);
	}

	@Post('admin/generate-link-sign-up')
	@Roles(RolesEnum.ADMIN)
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	@ApiOperation({
		summary: 'Admin: Create sign-up link for any organization',
		description:
			'Admin can create signup links for any organization by providing organizationId',
	})
	async adminCreateSignUpLink(@Body() adminCreateDto: AdminCreateSignUpLinkDto) {
		return await this.signupLinksService.generateLinkSignUpForAdmin(
			adminCreateDto.organizationId,
			adminCreateDto.startDate,
			adminCreateDto.expirationDate,
		);
	}

	@Get('admin/active')
	@Roles(RolesEnum.ADMIN)
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	@ApiOperation({
		summary: 'Admin: Get all sign-up links',
		description:
			'Admin can get all signup links, optionally filtered by organizationId',
	})
	async adminGetAllSignUpLinks(@Query('organizationId') organizationId?: string) {
		return await this.signupLinksService.getAdminSignUpLinks(organizationId);
	}
}
