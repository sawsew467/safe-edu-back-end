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
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAccessTokenGuard } from '@modules/auth/guards/jwt-access-token.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesEnum } from 'src/enums/roles..enum';

@Controller('quiz')
@ApiBearerAuth('token')
export class QuizController {
	constructor(private readonly quizService: QuizService) {}

	@Post('/create-quiz')
	@Roles(RolesEnum.ADMIN, RolesEnum.MANAGER)
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	@ApiOperation({ summary: 'Create a new quiz' })
	async create(@Body() createQuizDto: CreateQuizDto) {
		return this.quizService.create(createQuizDto);
	}

	@Get()
	@ApiQuery({ name: 'pageNumber', required: false, type: Number })
	@ApiQuery({ name: 'pageSize', required: false, type: Number })
	@ApiQuery({ name: 'searchPhase', required: false, type: String })
	@ApiQuery({ name: 'sortBy', required: false, type: String })
	@ApiQuery({ name: 'sortOrder', required: false, type: String })
	@ApiOperation({ summary: 'Get all quiz' })
	async findAll(
		@Query('searchPhase') searchPhase?: string,
		@Query('pageNumber') pageNumber?: number,
		@Query('pageSize') pageSize?: number,
		@Query('sortBy') sortBy?: string,
		@Query('sortOrder') sortOrder?: 'asc' | 'desc',
	) {
		if (!pageNumber || !pageSize) {
			return await this.quizService.findAll();
		}
		return this.quizService.findAll(
			searchPhase,
			pageNumber,
			pageSize,
			sortBy,
			sortOrder,
		);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get quiz by id' })
	async findOne(@Param('id') id: string) {
		return this.quizService.findOneById(id);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update quiz by id' })
	async update(@Param('id') id: string, @Body() updateQuizDto: UpdateQuizDto) {
		return this.quizService.update(id, updateQuizDto);
	}

	@Delete(':id')
	@ApiOperation({ summary: 'hard delete quiz by id' })
	async remove(@Param('id') id: string) {
		return this.quizService.remove(id);
	}

	@Get('get-all-by-quizId/:competitionId')
	@ApiOperation({ summary: 'get all by competition id' })
	async getAllByQuizId(@Param('competitionId') competitionId: string) {
		return this.quizService.getAllByCompetitionId(competitionId);
	}

	@Get('find-by-condition')
	@ApiOperation({ summary: 'find by condition' })
	async findByCondition() {}
}
