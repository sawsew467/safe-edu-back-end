import { use } from 'passport';
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
	UseInterceptors,
	UploadedFile,
	UnsupportedMediaTypeException,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAccessTokenGuard } from '@modules/auth/guards/jwt-access-token.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesEnum } from 'src/enums/roles..enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportQuestionsDto } from './dto/import-question.dto';
import { memoryStorage } from 'multer';
@Controller('questions')
@ApiBearerAuth('token')
export class QuestionsController {
	constructor(private readonly questionsService: QuestionsService) {}

	@Post('/create-question')
	@Roles(RolesEnum.ADMIN, RolesEnum.MANAGER)
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	@ApiOperation({ summary: 'Create a new question' })
	async create(@Body() createQuestionDto: CreateQuestionDto) {
		return this.questionsService.create(createQuestionDto);
	}

	@Get()
	@ApiQuery({ name: 'pageNumber', required: false, type: Number })
	@ApiQuery({ name: 'pageSize', required: false, type: Number })
	@ApiQuery({ name: 'searchPhase', required: false, type: String })
	@ApiQuery({ name: 'sortBy', required: false, type: String })
	@ApiQuery({ name: 'sortOrder', required: false, type: String })
	@ApiOperation({ summary: 'Get all questions' })
	async findAll(
		@Query('searchPhase') searchPhase?: string,
		@Query('pageNumber') pageNumber?: number,
		@Query('pageSize') pageSize?: number,
		@Query('sortBy') sortBy?: string,
		@Query('sortOrder') sortOrder?: 'asc' | 'desc',
	) {
		if (!pageNumber || !pageSize) {
			return await this.questionsService.findAll();
		}
		return this.questionsService.findAll(
			searchPhase,
			pageNumber,
			pageSize,
			sortBy,
			sortOrder,
		);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get question by Id' })
	async findOne(@Param('id') id: string) {
		return this.questionsService.findOneById(id);
	}

	@Patch(':id')
	@Roles(RolesEnum.ADMIN, RolesEnum.MANAGER)
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	@ApiOperation({ summary: 'Update question' })
	async update(
		@Param('id') id: string,
		@Body() updateQuestionDto: UpdateQuestionDto,
	) {
		return this.questionsService.update(id, updateQuestionDto);
	}

	@Delete(':id')
	@Roles(RolesEnum.ADMIN, RolesEnum.MANAGER)
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	@ApiOperation({ summary: 'Hard delete question by id' })
	async remove(@Param('id') id: string) {
		return this.questionsService.remove(id);
	}

	@Get('get-all-by-quizId/:quizId')
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	@ApiQuery({ name: 'filter', required: false, type: String })
	@ApiOperation({ summary: 'get all by quiz id' })
	async getAllByQuizId(
		@Param('quizId') quizId: string,
		@Req() req,
		@Query('filter') filter?: string,
	) {
		if (!filter)
			return this.questionsService.getAllByQuizId(quizId, req.user);
		else
			return this.questionsService.getAllByQuizId(
				quizId,
				req.user,
				filter,
			);
	}

	@Post('import-zip-file')
	@UseInterceptors(FileInterceptor('file'))
	@ApiOperation({ summary: 'Import questions from zip file' })
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				quizId: { type: 'string', example: '60b8d295f5ee123456789abc' },
				file: { type: 'file', format: 'binary' }
			},
		},
	})
	async importQuestionFromZipFile(
		@UploadedFile() file: Express.Multer.File, 
		@Body() body: ImportQuestionsDto) {
		return this.questionsService.importQuestionsFromZipFile(file, body.quizId);
	}
}
