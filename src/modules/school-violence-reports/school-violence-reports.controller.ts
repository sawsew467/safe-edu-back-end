import {
	Controller,
	Post,
	Get,
	Patch,
	Delete,
	Param,
	Body,
	Query,
	UseGuards,
	Req,
	UseInterceptors,
	UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
	ApiTags,
	ApiOperation,
	ApiBearerAuth,
	ApiConsumes,
} from '@nestjs/swagger';
import { SchoolViolenceReportsService } from './school-violence-reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';
import { UpdateEvidenceDto } from './dto/update-evidence.dto';
import { QueryReportDto } from './dto/query-report.dto';
import { QueryEmergencyContactDto } from './dto/query-emergency-contact.dto';
import { CreateEmergencyContactDto } from './dto/create-emergency-contact.dto';
import { UpdateEmergencyContactDto } from './dto/update-emergency-contact.dto';
import { JwtAccessTokenGuard } from '@modules/auth/guards/jwt-access-token.guard';
import { OptionalJwtGuard } from '@modules/auth/guards/optional-jwt.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesEnum } from 'src/enums/roles..enum';

@Controller('reports')
@ApiTags('School Violence Reports')
@ApiBearerAuth('token')
export class SchoolViolenceReportsController {
	constructor(
		private readonly schoolViolenceReportsService: SchoolViolenceReportsService,
	) {}

	@Post()
	@UseGuards(OptionalJwtGuard)
	@ApiOperation({ summary: 'Tạo báo cáo bạo lực học đường' })
	@UseInterceptors(FileInterceptor('evidence'))
	async createReport(@Body() createReportDto: CreateReportDto) {
		return this.schoolViolenceReportsService.createReport(createReportDto);
	}

	@Get('my-reports')
	@UseGuards(JwtAccessTokenGuard)
	@ApiOperation({ summary: 'Lấy danh sách báo cáo của tôi' })
	async getMyReports(@Query() query: QueryReportDto, @Req() req: any) {
		return this.schoolViolenceReportsService.getMyReports(
			req.user.userId,
			query,
		);
	}

	@Get(':id')
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	@ApiOperation({ summary: 'Lấy chi tiết báo cáo theo ID' })
	async getReportById(@Param('id') id: string, @Req() req: any) {
		return this.schoolViolenceReportsService.getReportById(
			id,
			req.user.userId,
			req.user.role,
			req.user.organizationId,
		);
	}

	@Get()
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	@Roles(RolesEnum.ADMIN)
	@ApiOperation({ summary: 'Lấy danh sách tất cả báo cáo (Admin only)' })
	async getAllReports(@Query() query: QueryReportDto) {
		return this.schoolViolenceReportsService.getAllReports(query);
	}

	@Patch(':id/status')
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	@Roles(RolesEnum.ADMIN, RolesEnum.MANAGER)
	@ApiOperation({ summary: 'Cập nhật trạng thái báo cáo (Admin only, Manager only)' })
	async updateReportStatus(
		@Param('id') id: string,
		@Body() updateStatusDto: UpdateReportStatusDto,
		@Req() req: any,
	) {
		return this.schoolViolenceReportsService.updateReportStatus(
			id,
			updateStatusDto,
			req.user?.userId,
			req.user?.organizationId,
		);
	}

	@Patch(':id/evidence')
	@UseGuards(JwtAccessTokenGuard)
	@ApiOperation({ summary: 'Cập nhật bằng chứng cho báo cáo (Chỉ người tạo)' })
	async updateEvidence(
		@Param('id') id: string,
		@Body() updateEvidenceDto: UpdateEvidenceDto,
		@Req() req: any,
	) {
		return this.schoolViolenceReportsService.updateEvidence(
			id,
			updateEvidenceDto,
			req.user?.userId,
		);
	}
}

@Controller('reports-organization')
@ApiTags('School Violence Reports - Organization')
@ApiBearerAuth('token')
export class SchoolViolenceReportsOrganizationController {
	constructor(
		private readonly schoolViolenceReportsService: SchoolViolenceReportsService,
	) {}

	@Get()
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	@Roles(RolesEnum.MANAGER, RolesEnum.SUPERVISOR)
	@ApiOperation({ summary: 'Lấy danh sách báo cáo của tổ chức' })
	async getOrganizationReports(
		@Query() query: QueryReportDto,
		@Req() req: any,
	) {
		return this.schoolViolenceReportsService.getOrganizationReports(
			req.user.organizationId,
			query,
		);
	}
}

@Controller('emergency-contacts')
@ApiTags('Emergency Contacts')
@ApiBearerAuth('token')
export class EmergencyContactsController {
	constructor(
		private readonly schoolViolenceReportsService: SchoolViolenceReportsService,
	) {}

	@Post()
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	@Roles(RolesEnum.ADMIN, RolesEnum.MANAGER)
	@ApiOperation({ summary: 'Tạo emergency contact' })
	async createEmergencyContact(@Body() createDto: CreateEmergencyContactDto, @Req() req: any) {
		if (req.user.role === RolesEnum.MANAGER) {
			createDto.organizationId = req.user.organizationId;
		}
		return this.schoolViolenceReportsService.createEmergencyContact(createDto);
	}

	@Get()
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	@Roles(RolesEnum.ADMIN, RolesEnum.MANAGER)
	@ApiOperation({ summary: 'Lấy danh sách emergency contacts' })
	async getEmergencyContacts(@Req() req: any) {
		const organizationId =
			req.user.role === RolesEnum.MANAGER ? req.user.organizationId : null;
		return this.schoolViolenceReportsService.getEmergencyContacts(
			organizationId,
		);
	}

	@Patch(':id')
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	@Roles(RolesEnum.ADMIN, RolesEnum.MANAGER)
	@ApiOperation({ summary: 'Cập nhật emergency contact' })
	async updateEmergencyContact(
		@Param('id') id: string,
		@Body() updateDto: UpdateEmergencyContactDto,
	) {
		return this.schoolViolenceReportsService.updateEmergencyContact(
			id,
			updateDto,
		);
	}

	@Delete(':id')
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	@Roles(RolesEnum.ADMIN, RolesEnum.MANAGER)
	@ApiOperation({ summary: 'Xóa emergency contact' })
	async deleteEmergencyContact(@Param('id') id: string) {
		return this.schoolViolenceReportsService.deleteEmergencyContact(id);
	}
}

@Controller('emergency-logs')
@ApiTags('Emergency Logs')
@ApiBearerAuth('token')
export class EmergencyLogsController {
	constructor(
		private readonly schoolViolenceReportsService: SchoolViolenceReportsService,
	) {}

	@Get()
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	@Roles(RolesEnum.ADMIN)
	@ApiOperation({ summary: 'Lấy danh sách emergency logs (Admin only)' })
	async getEmergencyLogs(@Query() query: QueryEmergencyContactDto) {
		return this.schoolViolenceReportsService.getEmergencyLogs(query);
	}
}
