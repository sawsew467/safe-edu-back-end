import { use } from 'passport';
import { Citizen } from '@modules/citizens/entities/citizen.entity';
import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseGuards,
	Request,
	Req,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAccessTokenGuard } from '@modules/auth/guards/jwt-access-token.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Student } from './entities/student.entity';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesEnum } from 'src/enums/roles..enum';
import { ChangePasswordDTO } from './dto/change-password';

@Controller('students')
@ApiTags('students')
// @Roles(RolesEnum.ADMIN, RolesEnum.SUPERVISOR, RolesEnum.MANAGER)
// @UseGuards(JwtAccessTokenGuard, RolesGuard)
@ApiBearerAuth('token')
export class StudentsController {
	constructor(private readonly studentsService: StudentsService) { }

	@Post()
	@Roles(RolesEnum.ADMIN)
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	@ApiOperation({ summary: 'Create a new student' })
	async create(@Body() createStudentDto: CreateStudentDto, @Request() req) {
		return await this.studentsService.create(createStudentDto);
	}

	@Get()
	@Roles(RolesEnum.ADMIN, RolesEnum.MANAGER, RolesEnum.SUPERVISOR)
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	@ApiOperation({ summary: 'Retrieve all students' })
	async findAll() {
		return await this.studentsService.findAll();
	}

	@Get('count')
	@Roles(RolesEnum.ADMIN, RolesEnum.MANAGER)
	@ApiOperation({ summary: 'Đếm tổng số người dùng trên hệ thống' })
	async getCitizenCount() {
		return this.studentsService.countAllUsers();
	}

	@Get('/orgId/:organizationId')
	@ApiOperation({ summary: 'Lấy tất cả học sinh theo Organization ID' })
	async findByOrgId(@Param('organizationId') organizationId: string) {
		return this.studentsService.findByOrgId(organizationId);
	}

	@Get('/username/:username')
	@ApiOperation({ summary: 'Retrieve a user by username' })
	async getProfile(@Param('username') username: string) {
		return await this.studentsService.getProfile(username);
	}

	@Post('/change-password')
	@Roles(RolesEnum.STUDENT, RolesEnum.CITIZEN)
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	@ApiOperation({ summary: 'Retrieve a user by ID' })
	async changePassword(@Body() data: ChangePasswordDTO, @Req() req) {
		return await this.studentsService.changePassword(data, req.user.userId);
	}
	@Post('/update-profile')
	@Roles(RolesEnum.STUDENT, RolesEnum.CITIZEN)
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	@ApiOperation({ summary: 'Retrieve a user by ID' })
	async updateProfile(@Body() data: UpdateStudentDto, @Req() req) {
		return await this.studentsService.updateProfile(data, req.user.userId);
	}

	@Get(':id')
	@Roles(RolesEnum.ADMIN, RolesEnum.MANAGER, RolesEnum.STUDENT)
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	@ApiOperation({ summary: 'Retrieve a user by ID' })
	async findOne(@Param('id') id: string) {
		return await this.studentsService.findOne(id);
	}

	@Get('/get-profile/user')
	@Roles(
		RolesEnum.ADMIN,
		RolesEnum.MANAGER,
		RolesEnum.STUDENT,
		RolesEnum.CITIZEN,
	)
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	@ApiOperation({ summary: 'Retrieve a user by ID' })
	async gerUser(@Req() req) {
		return await this.studentsService.gerUser(req.user.userId);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update a student by ID' })
	async update(
		@Param('id') id: string,
		@Body() updateStudentDto: UpdateStudentDto,
	): Promise<Student> {
		return await this.studentsService.update(id, updateStudentDto);
	}

	@Delete('unActive/:id')
	@ApiOperation({ summary: 'Delete a student by ID' })
	async Unactive(@Param('id') id: string): Promise<void> {
		await this.studentsService.unActive(id);
	}

	@Delete('delete')
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	@ApiOperation({ summary: 'Delete a student by ID' })
	async remove(@Req() req): Promise<void> {
		await this.studentsService.remove(req.user.userId);
	}

	@Get('phone/:phone_number')
	@ApiOperation({ summary: 'Retrieve a user by phone_number' })
	async findOneByPhoneNumber(
		@Param('phone_number') phone_number: string,
		action: string,
	): Promise<Student> {
		return await this.studentsService.findOneByCondition(
			{ phone_number },
			action,
		);
	}

	@Patch(':id/isActive')
	@ApiOperation({ summary: 'Update isActive true' })
	async setIsActiveTrue(@Param('id') id: string) {
		return await this.studentsService.setIsActiveTrue(id);
	}
}
