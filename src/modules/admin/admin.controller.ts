import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseInterceptors,
	UseGuards,
	HttpException,
	HttpStatus,
	Put,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import MongooseClassSerializerInterceptor from 'src/interceptors/mongoose-class-serializer.interceptor';

// Inner imports

// Outer imports
import { JwtAccessTokenGuard } from '@modules/auth/guards/jwt-access-token.guard';

import { Admin } from './entities/admin.entity';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesEnum } from 'src/enums/roles..enum';
import { RolesGuard } from '@modules/auth/guards/roles.guard';

@Controller('admin')
@ApiTags('admin')
@UseInterceptors(MongooseClassSerializerInterceptor(Admin))
@Roles(RolesEnum.ADMIN)
@UseGuards(JwtAccessTokenGuard, RolesGuard)
@ApiBearerAuth('token')
export class AdminController {
	constructor(private readonly adminService: AdminService) {}

	@Post()
	@ApiOperation({ summary: 'Create a new admin' })
	async create(@Body() createAdminDto: CreateAdminDto): Promise<Admin> {
		return await this.adminService.create(createAdminDto);
	}

	@Get()
	async findAll() {
		return await this.adminService.findAll();
	}

	@Get(':id')
	@ApiOperation({ summary: 'Retrieve a admin by ID' })
	async findOne(@Param('id') id: string): Promise<Admin> {
		return await this.adminService.findOneById(id);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update a admin by ID' })
	async update(
		@Param('id') id: string,
		@Body() updateAdminDto: UpdateAdminDto,
	): Promise<Admin> {
		return await this.adminService.update(id, updateAdminDto);
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Delete a user by ID' })
	// @UseGuards(JwtAccessTokenGuard)
	async remove(@Param('id') id: string) {
		await this.adminService.delete(id);
	}

	@Put(':id')
	@ApiOperation({ summary: 'Set isActive true' })
	async setIsActiveTrue(@Param('id') id: string) {
		return await this.adminService.setActiveIsTrue(id);
	}
}
