import { UserAchievement } from './../user-achievements/entities/user-achievement.entity';
import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseGuards,
	Query,
	Req,
	Headers,
	HttpStatus,
} from '@nestjs/common';
import { CompetitionsService } from './competitions.service';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { UpdateCompetitionDto } from './dto/update-competition.dto';
import {
	ApiBearerAuth,
	ApiOperation,
	ApiQuery,
	ApiTags,
} from '@nestjs/swagger';
import { JwtAccessTokenGuard } from '@modules/auth/guards/jwt-access-token.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesEnum } from 'src/enums/roles..enum';

@Controller('competitions')
// @UseGuards(JwtAccessTokenGuard, RolesGuard)
@ApiBearerAuth('token')
export class CompetitionsController {
	constructor(private readonly competitionsService: CompetitionsService) { }

	@Post()
	@ApiOperation({ summary: 'Create new competition' })
	//@Roles(RolesEnum.ADMIN, RolesEnum.MANAGER)
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	async create(
		@Body() createCompetitionDto: CreateCompetitionDto,
		@Headers('organizationId') organizationId?: string,
	) {
		if (!organizationId) {
			return this.competitionsService.create(createCompetitionDto);
		} else {
			return this.competitionsService.create(
				createCompetitionDto,
				organizationId,
			);
		}
	}

	@Get()
	@ApiQuery({ name: 'filter', required: false, type: String })
	@ApiQuery({ name: 'pageNumber', required: false, type: Number })
	@ApiQuery({ name: 'pageSize', required: false, type: Number })
	@ApiQuery({ name: 'searchPhase', required: false, type: String })
	@ApiQuery({ name: 'sortBy', required: false, type: String })
	@ApiQuery({ name: 'sortOrder', required: false, type: String })
	// @Roles(RolesEnum.ADMIN)
	@ApiOperation({ summary: 'Retrieve all competitions' })
	async findAll(
		@Req() req,
		@Query('filter') filter?: string,
		@Query('searchPhase') searchPhase?: string,
		@Query('pageNumber') pageNumber?: number,
		@Query('pageSize') pageSize?: number,
		@Query('sortBy') sortBy?: string,
		@Query('sortOrder') sortOrder?: 'asc' | 'desc',
	) {
		if (!pageNumber || !pageSize) {
			return await this.competitionsService.findAll(req.user);
		}
		return this.competitionsService.findAll(
			req.user,
			filter,
			searchPhase,
			pageNumber,
			pageSize,
			sortBy,
			sortOrder,
		);
	}

	@Get('/user')
	@ApiQuery({ name: 'filter', required: false, type: String })
	@ApiQuery({ name: 'pageNumber', required: false, type: Number })
	@ApiQuery({ name: 'pageSize', required: false, type: Number })
	@ApiQuery({ name: 'searchPhase', required: false, type: String })
	@ApiQuery({ name: 'sortBy', required: false, type: String })
	@ApiQuery({ name: 'sortOrder', required: false, type: String })
	// @Roles(RolesEnum.ADMIN)
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	@ApiOperation({ summary: 'Retrieve all competitions' })
	async findAllLogin(
		@Req() req,
		@Query('filter') filter?: string,
		@Query('searchPhase') searchPhase?: string,
		@Query('pageNumber') pageNumber?: number,
		@Query('pageSize') pageSize?: number,
		@Query('sortBy') sortBy?: string,
		@Query('sortOrder') sortOrder?: 'asc' | 'desc',
	) {
		if (!pageNumber || !pageSize) {
			return await this.competitionsService.findAll(req.user);
		}
		return this.competitionsService.findAll(
			req.user,
			filter,
			searchPhase,
			pageNumber,
			pageSize,
			sortBy,
			sortOrder,
		);
	}

	@Get('monthly-stats')
	@ApiOperation({ summary: 'Thống kê số cuộc thi theo từng tháng trong 12 tháng qua' })
	async countByMonth() {
		const result = await this.competitionsService.countMonthly();
		return {
			code: HttpStatus.OK,
			message: 'Thống kê số cuộc thi theo tháng',
			data: result,
		};
	}

	@Get('/for-user')
	@UseGuards(JwtAccessTokenGuard)
	@ApiOperation({ summary: 'Find competitions for current user' })
	async findByOrgIdAndAll(@Req() req) {
		return this.competitionsService.findByOrgIdAndAll(req.user.userId);
	}



	@Get(':id')
	@ApiOperation({ summary: 'Find competition by Id' })
	async findById(
		@Param('id') id: string
	) {
		return this.competitionsService.findById(id);
	}

	@Get('/orgId/:organizationId')
	@ApiOperation({ summary: 'Find competition by OrgId' })
	async findByOrgId(
		@Headers('organizationId') organizationId?: string,
	) {

		return this.competitionsService.findByOrgId(organizationId);
	}

	

	@Patch(':id')
	@Roles(RolesEnum.ADMIN, RolesEnum.MANAGER)
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	@ApiOperation({ summary: 'Update competition' })
	update(
		@Param('id') id: string,
		@Body() updateCompetitionDto: UpdateCompetitionDto,
		@Headers('organizationId') organizationId?: string,
	) {
		return this.competitionsService.update(id, updateCompetitionDto);
	}

	@Delete(':id')
	@Roles(RolesEnum.ADMIN, RolesEnum.MANAGER)
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	@ApiOperation({ summary: 'Delete competition (set isActive false)' })
	async remove(@Param('id') id: string) {
		return await this.competitionsService.remove(id);
	}
	@Get('/isActive/:id')
	@Roles(RolesEnum.ADMIN, RolesEnum.MANAGER)
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	@ApiOperation({ summary: 'active competitions' })
	async avtive(@Param('id') id: string) {
		return await this.competitionsService.active(id);
	}

	@Get('/slug/:slug')
	@ApiOperation({ summary: 'Find by slug' })
	async findBySlug(@Param('slug') slug: string) {
		return await this.competitionsService.findBySlug(slug);
	}

	@Get('/leaderboard/:slug')
	@ApiOperation({ summary: 'Find by slug' })
	async getLeaderBoadBySlug(@Param('slug') slug: string) {
		return await this.competitionsService.findleaderBoadBySlug(slug);
	}
	@Get('/get-all-quiz-by-slug/:slug')
	@ApiOperation({ summary: 'get all by competition id' })
	async getAllBySlug(@Param('slug') slug: string) {
		return this.competitionsService.getAllBySlug(slug);
	}
}
