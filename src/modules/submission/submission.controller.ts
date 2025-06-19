import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Query,
	Req,
	UseGuards,
} from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAccessTokenGuard } from '@modules/auth/guards/jwt-access-token.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';

@Controller('submission')
@ApiBearerAuth('token')
export class SubmissionController {
	constructor(private readonly submissionService: SubmissionService) {}

	@Post()
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	create(@Body() createSubmissionDto: CreateSubmissionDto, @Req() req) {
		return this.submissionService.submitAnswer(
			createSubmissionDto,
			req.user.userId,
		);
	}

	@Get()
	@ApiQuery({ name: 'pageNumber', required: false, type: Number })
	@ApiQuery({ name: 'pageSize', required: false, type: Number })
	@ApiQuery({ name: 'searchPhase', required: false, type: String })
	@ApiQuery({ name: 'sortBy', required: false, type: String })
	@ApiQuery({ name: 'sortOrder', required: false, type: String })
	@ApiOperation({ summary: 'Get all submissions' })
	async findAll(
		@Query('searchPhase') searchPhase?: string,
		@Query('pageNumber') pageNumber?: number,
		@Query('pageSize') pageSize?: number,
		@Query('sortBy') sortBy?: string,
		@Query('sortOrder') sortOrder?: 'asc' | 'desc',
	) {
		if (!pageNumber || !pageSize) {
			return await this.submissionService.findAll();
		}
		return this.submissionService.findAll(
			searchPhase,
			pageNumber,
			pageSize,
			sortBy,
			sortOrder,
		);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get submission by userId' })
	async findByUserId(@Param('id') id: string) {
		return this.submissionService.findOneByUserId(id);
	}
}
