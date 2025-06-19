import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseGuards,
} from '@nestjs/common';
import { SupervisorsService } from './supervisors.service';
import { CreateSupervisorDto } from './dto/create-supervisor.dto';
import { UpdateSupervisorDto } from './dto/update-supervisor.dto';
import { ApiOperation } from '@nestjs/swagger';
import { Supervisor } from './entities/supervisor.entity';
import { JwtAccessTokenGuard } from '@modules/auth/guards/jwt-access-token.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesEnum } from 'src/enums/roles..enum';

@Controller('supervisors')
@Roles(RolesEnum.ADMIN, RolesEnum.SUPERVISOR)
@UseGuards(JwtAccessTokenGuard, RolesGuard)
export class SupervisorsController {
	constructor(private readonly supervisorsService: SupervisorsService) {}

	@Post()
	@ApiOperation({ summary: 'Create a new supervisor' })
	async create(@Body() createSupervisorDto: CreateSupervisorDto) {
		return this.supervisorsService.create(createSupervisorDto);
	}

	@Get()
	@ApiOperation({ summary: 'Retrieve all supervisor' })
	async findAll() {
		return this.supervisorsService.findAll();
	}

	@Get(':id')
	@ApiOperation({ summary: 'Retrieve supervisor by condition' })
	async findOne(@Param('id') id: string) {
		return this.supervisorsService.findOne(id);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update a supervisor' })
	async update(
		@Param('id') id: string,
		@Body() updateSupervisorDto: UpdateSupervisorDto,
	) {
		return this.supervisorsService.update(id, updateSupervisorDto);
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Delete a supervisor' })
	async remove(@Param('id') id: string) {
		return this.supervisorsService.delete(id);
	}

	@Patch(':id/setIsActive')
	@ApiOperation({ summary: 'Update isActive true' })
	async setIsActiveTrue(@Param('id') id: string): Promise<Supervisor> {
		return this.supervisorsService.setIsActiveTrue(id);
	}
}
