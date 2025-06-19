import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Query,
	UseGuards,
	Req,
} from '@nestjs/common';
import { QuizResultService } from './quiz-result.service';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAccessTokenGuard } from '@modules/auth/guards/jwt-access-token.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesEnum } from 'src/enums/roles..enum';
import { GradePictureDto } from '@modules/picture/dto/grade-picture.dto';

@Controller('quiz-result')
@ApiBearerAuth('token')
export class QuizResultController {
	constructor(private readonly quizResultService: QuizResultService) { }

	

	@Get()
	@ApiQuery({ name: 'pageNumber', required: false, type: Number })
	@ApiQuery({ name: 'pageSize', required: false, type: Number })
	@ApiQuery({ name: 'searchPhase', required: false, type: String })
	@ApiQuery({ name: 'filter', required: false, type: String })
	@ApiQuery({ name: 'sortBy', required: false, type: String })
	@ApiQuery({ name: 'sortOrder', required: false, type: String })
	@ApiOperation({ summary: 'Get all submissions' })
	async findAll(
		@Query('filter') filter?: string,
		@Query('searchPhase') searchPhase?: string,
		@Query('pageNumber') pageNumber?: number,
		@Query('pageSize') pageSize?: number,
		@Query('sortBy') sortBy?: string,
		@Query('sortOrder') sortOrder?: 'asc' | 'desc',
	) {
		if (!pageNumber || !pageSize) {
			return await this.quizResultService.findAll();
		}
		return this.quizResultService.findAll(
			filter,
			searchPhase,
			pageNumber,
			pageSize,
			sortBy,
			sortOrder,
		);
	}

	@Get('monthly-stat')
	async getMonthlyStat() {
		return this.quizResultService.getMonthlyStats();
	}

	
	@Get('/is-submit/:id')
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	@ApiOperation({ summary: 'check user is submit this quiz' })
	async isDoQuiz(@Param('id') id: string, @Req() req) {
		return this.quizResultService.isDoQuiz(id, req.user.userId);
	}


	@Get(':id')
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	@Roles(RolesEnum.STUDENT, RolesEnum.CITIZEN)
	getSubmit(@Req() req, @Param('id') id: string) {
		return this.quizResultService.calculateQuizResult(id, req.user.userId);
	}


	@Post('/grade-picture')
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	@Roles(RolesEnum.ADMIN, RolesEnum.MANAGER)
	@ApiOperation({ summary: 'grade picture' })
	async gradePicture(@Body() gradePictureDto: GradePictureDto) {
		return this.quizResultService.gradePicture(gradePictureDto);
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.quizResultService.findOne(id);
	}
}
