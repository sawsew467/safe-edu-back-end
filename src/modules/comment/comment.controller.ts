import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseGuards,
	Req,
} from '@nestjs/common';
import { CommnetService } from './comment.service';
import { CreateCommnetDto } from './dto/create-commnet.dto';
import { UpdateCommnetDto } from './dto/update-commnet.dto';
import { JwtAccessTokenGuard } from '@modules/auth/guards/jwt-access-token.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('comments')
@ApiTags('Comments')
@ApiBearerAuth('token')
export class CommnetController {
	constructor(private readonly commnetService: CommnetService) {}

	@Post()
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	async create(@Body() createCommnetDto: CreateCommnetDto, @Req() req) {
		return await this.commnetService.create(createCommnetDto, req.user.userId);
	}

	@Get()
	findAll() {
		return this.commnetService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.commnetService.findOne(+id);
	}

	@Get('/get-by-picture_id/:picture_id')
	async getByPicture(@Param('picture_id') picture_id: string) {
		return await this.commnetService.findByPicture(picture_id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateCommnetDto: UpdateCommnetDto) {
		return this.commnetService.update(+id, updateCommnetDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.commnetService.remove(+id);
	}
}
