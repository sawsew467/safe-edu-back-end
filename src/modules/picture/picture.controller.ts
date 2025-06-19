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
} from '@nestjs/common';
import { PictureService } from './picture.service';
import { CreatePictureDto } from './dto/create-picture.dto';
import { UpdatePictureDto } from './dto/update-picture.dto';
import { JwtAccessTokenGuard } from '@modules/auth/guards/jwt-access-token.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesEnum } from 'src/enums/roles..enum';
import {
	ApiBearerAuth,
	ApiOperation,
	ApiQuery,
	ApiTags,
} from '@nestjs/swagger';

@Controller('picture')
@ApiTags('picture')
@ApiBearerAuth('token')
export class PictureController {
	constructor(private readonly pictureService: PictureService) {}

	@Post('/submited')
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	@Roles(RolesEnum.STUDENT, RolesEnum.CITIZEN)
	create(@Body() createPictureDto: CreatePictureDto, @Req() req) {
		return this.pictureService.create(createPictureDto, req.user.userId);
	}

	@Get()
	@ApiQuery({ name: 'pageNumber', required: false, type: Number })
	@ApiQuery({ name: 'pageSize', required: false, type: Number })
	@ApiQuery({ name: 'searchPhase', required: false, type: String })
	@ApiQuery({ name: 'filter', required: false, type: String })
	@ApiQuery({ name: 'sortBy', required: false, type: String })
	@ApiQuery({ name: 'sortOrder', required: false, type: String })
	@ApiOperation({ summary: 'Get all questions' })
	async findAll(
		@Query('filter') filter?: string,
		@Query('searchPhase') searchPhase?: string,
		@Query('pageNumber') pageNumber?: number,
		@Query('pageSize') pageSize?: number,
		@Query('sortBy') sortBy?: string,
		@Query('sortOrder') sortOrder?: 'asc' | 'desc',
	) {
		return this.pictureService.findAll(
			filter,
			searchPhase,
			pageNumber,
			pageSize,
			sortBy,
			sortOrder,
		);
	}

	@Get('/get-all-by-quizId/:quiz_id')
	getAllPictureByQuizId(@Param('quiz_id') quiz_id: string) {
		return this.pictureService.findAllByQuizId(quiz_id);
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.pictureService.findOneByPictureId(id);
	}

	@Get('/my-picture/:quiz_id')
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	@Roles(RolesEnum.STUDENT, RolesEnum.CITIZEN)
	getPicture(@Param('quiz_id') quiz_id: string, @Req() req) {
		return this.pictureService.findMyPicture(quiz_id, req.user.userId);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.pictureService.remove(id);
	}
}
