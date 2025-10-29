import { AdminRepository } from '@repositories/admin.repository';
import { StudentsRepository } from '@repositories/student.repository';
import {
	Injectable,
	Inject,
	NotFoundException,
	ForbiddenException,
	BadRequestException,
} from '@nestjs/common';
import { ReportRepositoryInterface } from './interfaces/report-repository.interface';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';
import { UpdateEvidenceDto } from './dto/update-evidence.dto';
import { QueryReportDto } from './dto/query-report.dto';
import { QueryEmergencyContactDto } from './dto/query-emergency-contact.dto';
import { CreateEmergencyContactDto } from './dto/create-emergency-contact.dto';
import { UpdateEmergencyContactDto } from './dto/update-emergency-contact.dto';
import mongoose, { Types } from 'mongoose';
import { MailService, ReportEmailData } from '@modules/mail/mail.service';
import { StudentsRepositoryInterface } from '@modules/students/interfaces/students.interface';
import { AdminRepositoryInterface } from '@modules/admin/interfaces/admin.interface';
import { OrganizationsRepositoryInterface } from '@modules/organizations/interfaces/organizations.interface';
import { EmergencyContactRepositoryInterface } from './interfaces/emergency-contact-repository.interface';
import { CitizensRepositoryInterface } from '@modules/citizens/interfaces/citizens.interfaces';
import { RolesEnum } from 'src/enums/roles..enum';
import { ImpactLevel } from 'src/enums/impact-level.enum';
import { CurrentSituation } from 'src/enums/current-situation.enum';
import { ReportStatusHistoryRepositoryInterface } from './interfaces/report-status-history-repository.interface';
import { Report } from './entities/report.entity';

@Injectable()
export class SchoolViolenceReportsService {
	constructor(
		@Inject('ReportRepositoryInterface')
		private readonly reportRepository: ReportRepositoryInterface,
		@Inject('EmergencyContactRepositoryInterface')
		private readonly emergencyContactRepository: EmergencyContactRepositoryInterface,
		@Inject('ReportStatusHistoryRepositoryInterface')
		private readonly statusHistoryRepository: ReportStatusHistoryRepositoryInterface,
		@Inject('StudentsRepositoryInterface')
		private readonly studentsRepository: StudentsRepositoryInterface,
		@Inject('CitizensRepositoryInterface')
		private readonly citizenRepository: CitizensRepositoryInterface,
		@Inject('OrganizationsRepositoryInterface')
		private readonly organizationRepository: OrganizationsRepositoryInterface,
		@Inject('AdminRepositoryInterface')
		private readonly adminRepository: AdminRepositoryInterface,
		private readonly mailService: MailService,
	) {}

	/**
	 * Helper method to extract ObjectId string from a field that might be populated
	 */
	private getObjectIdString(field: any): string {
		if (!field) {
			return null;
		}
		// If field is a populated object with _id
		if (typeof field === 'object' && field._id) {
			return field._id.toString();
		}
		// If field is already an ObjectId or string
		return field.toString();
	}

	/**
	 * Helper method to extract organization name from populated organizationId
	 */
	private getOrganizationName(organizationField: any): string {
		if (!organizationField) {
			return 'Trường học';
		}
		// If organizationField is a populated object with name
		if (typeof organizationField === 'object' && organizationField.name) {
			return organizationField.name;
		}
		return 'Trường học';
	}

	private async getRecipientEmails(
		alertLevel: number,
		organizationId: string,
	): Promise<string[]> {
		const emergencyContacts =
			await this.emergencyContactRepository.findByOrganizationOrGlobal(
				organizationId,
			);

		if (!emergencyContacts || emergencyContacts.length === 0) {
			console.warn(
				`No emergency contacts found for organization: ${organizationId}`,
			);
			return [];
		}

		const emailSet = new Set<string>();

		switch (alertLevel) {
			case 1:
				return [];

			case 2:
				emergencyContacts
					.filter(
						(contact) =>
							contact.role === 'student-affairs-officer' && contact.email,
					)
					.forEach((contact) => emailSet.add(contact.email));
				break;

			case 3:
				emergencyContacts
					.filter(
						(contact) =>
							[
								'vice-principal',
								'board-of-directors',
								'principal',
								'student-affairs-officer',
							].includes(contact.role) && contact.email,
					)
					.forEach((contact) => emailSet.add(contact.email));
				break;

			case 4:
				emergencyContacts
					.filter((contact) => contact.email)
					.forEach((contact) => emailSet.add(contact.email));
				break;

			default:
				console.error(`Invalid alert level: ${alertLevel}`);
				return [];
		}

		return Array.from(emailSet);
	}

	private async sendAlertEmail(
		report: any,
		organizationName?: string,
	): Promise<void> {
		try {
			const organizationId = this.getObjectIdString(report.organizationId);
			const orgName =
				organizationName || this.getOrganizationName(report.organizationId);

			const recipientEmails = await this.getRecipientEmails(
				report.alertLevel,
				organizationId,
			);

			if (recipientEmails.length === 0) {
				console.warn(
					`No recipient emails found for alert level ${report.alertLevel}`,
				);
				return;
			}

			const reportEmailData: ReportEmailData = {
				reportId: report._id.toString(),
				victimName: report.victimName,
				classGrade: report.classGrade,
				impactLevel: report.impactLevel,
				currentSituation: report.currentSituation,
				alertLevel: report.alertLevel,
				timeOfIncident: report.timeOfIncident,
				organizationName: orgName,
				violenceTypes: report.violenceTypes,
			};

			const success = await this.mailService.sendAlertByLevel(
				report.alertLevel,
				recipientEmails,
				reportEmailData,
			);

			if (success) {
				console.log(
					`Alert email sent successfully for report ${report._id} (Level ${report.alertLevel})`,
				);
			} else {
				console.error(`Failed to send alert email for report ${report._id}`);
			}
		} catch (error) {
			console.error('Error sending alert email:', error);
		}
	}

	calculateAlertLevel(
		impactLevel: ImpactLevel,
		currentSituation: CurrentSituation,
		hasEvidence: boolean,
	): number {
		if (
			hasEvidence ||
			(impactLevel === ImpactLevel.SEVERE &&
				currentSituation === CurrentSituation.ESCALATING)
		) {
			return 4;
		}

		if (
			impactLevel === ImpactLevel.SEVERE &&
			currentSituation !== CurrentSituation.ENDED
		) {
			return 3;
		}

		if (
			impactLevel === ImpactLevel.MODERATE &&
			(currentSituation === CurrentSituation.STILL_HAPPENING ||
				currentSituation === CurrentSituation.ESCALATING)
		) {
			return 2;
		}

		return 1;
	}

	async createReport(createReportDto: CreateReportDto) {
		const {
			victim_name,
			class_grade,
			gender,
			relationship_to_victim,
			relationship_other,
			violence_types,
			violence_other,
			location,
			location_other,
			time_of_incident,
			impact_level,
			current_situation,
			information_sources,
			information_reliability,
			contact_infor,
			organizationId,
			evidence,
			additional_details,
		} = createReportDto;

		let hasEvidence = false;

		if (evidence?.length !== 0) {
			hasEvidence = true;
		}

		const alertLevel = this.calculateAlertLevel(
			impact_level,
			current_situation,
			hasEvidence,
		);

		const report = await this.reportRepository.create({
			victimName: victim_name,
			classGrade: class_grade,
			gender,
			relationshipToVictim: relationship_to_victim,
			relationshipOther: relationship_other,
			violenceTypes: violence_types || [],
			violenceOther: violence_other,
			location,
			locationOther: location_other,
			timeOfIncident: time_of_incident,
			impactLevel: impact_level,
			currentSituation: current_situation,
			informationSources: information_sources || [],
			informationReliability: information_reliability,
			contactInfo: contact_infor,
			organizationId: new mongoose.Types.ObjectId(organizationId),
			alertLevel,
			hasEvidence,
			evidenceUrl: evidence,
			status: 'Pending',
			additional_details,
		});

		// Save initial status to history
		await this.statusHistoryRepository.create({
			reportId: report._id as any,
			oldStatus: null,
			newStatus: 'Pending',
			note: 'Báo cáo được tạo',
			changedAt: new Date(),
		});

		this.sendAlertEmail(report).catch((error) => {
			console.error('Failed to send alert email:', error);
		});

		return {
			ok: true,
			id: report._id.toString(),
			alertLevel: report.alertLevel,
		};
	}

	/**
	 * Get status timeline for a report
	 */
	private async getStatusTimeline(reportId: string) {
		const timeline =
			await this.statusHistoryRepository.findByReportId(reportId);
		return timeline.map((history: any) => ({
			oldStatus: history.oldStatus,
			newStatus: history.newStatus,
			changedBy: history.changedBy,
			note: history.note,
			changedAt: history.changedAt || history.created_at,
		}));
	}

	/**
	 * Get status timeline for multiple reports
	 */
	private async getStatusTimelinesForReports(reportIds: string[]) {
		const timelines =
			await this.statusHistoryRepository.findByReportIds(reportIds);
		const timelineMap: Record<string, any[]> = {};

		timelines.forEach((history: any) => {
			const reportId = history.reportId.toString();
			if (!timelineMap[reportId]) {
				timelineMap[reportId] = [];
			}
			timelineMap[reportId].push({
				oldStatus: history.oldStatus,
				newStatus: history.newStatus,
				changedBy: history.changedBy,
				note: history.note,
				changedAt: history.changedAt || history.created_at,
			});
		});

		return timelineMap;
	}


	/**
	 * Get report by ID with role-based access control
	 */
	async getReportById(
		id: string,
		userId: string,
		userRole: string,
		userOrgId?: string,
	) {
		const report = await this.reportRepository.findById(id);

		if (!report) {
			throw new NotFoundException('Báo cáo không tồn tại');
		}

		// Admin can view all reports
		if (userRole === RolesEnum.ADMIN) {
			const timeline = await this.getStatusTimeline(id);
			return {
				ok: true,
				data: {
					...(report as any).toObject(),
					statusTimeline: timeline,
				},
			};
		}

		const reportOrgId = this.getObjectIdString(report.organizationId);
		if (
			reportOrgId !== userOrgId?.toString() &&
			report.created_by.toString() !== userId.toString()
		) {
			throw new ForbiddenException('Bạn không có quyền xem báo cáo này');
		}


		const timeline = await this.getStatusTimeline(id);
		return {
			ok: true,
			data: {
				...(report as any).toObject(),
				statusTimeline: timeline,
			},
		};
	}

	/**
	 * Get all reports with filters (Admin only)
	 */
	async getAllReports(query: QueryReportDto) {
		const {
			organizationId,
			level,
			status,
			from,
			to,
			limit = 10,
			page = 1,
		} = query;

		const filter: any = {};

		if (organizationId) {
			filter.organizationId = new mongoose.Types.ObjectId(organizationId);
		}

		if (level) {
			filter.alertLevel = parseInt(level);
		}

		if (status) {
			filter.status = status;
		}

		if (from || to) {
			filter.created_at = {};
			if (from) {
				filter.created_at.$gte = new Date(from);
			}
			if (to) {
				filter.created_at.$lte = new Date(to);
			}
		}

		const skip = (page - 1) * limit;
		const { items, total } = await this.reportRepository.findAll(
			filter,
			skip,
			limit,
		);

		// Get timelines for all reports
		const reportIds = items.map((item) => (item._id as any).toString());
		const timelineMap = await this.getStatusTimelinesForReports(reportIds);

		// Add timeline to each report
		const itemsWithTimeline = items.map((item: any) => {
			const reportId = item._id.toString();
			return {
				...item.toObject(),
				statusTimeline: timelineMap[reportId] || [],
			};
		});

		return {
			ok: true,
			data: itemsWithTimeline,
			meta: {
				total,
				page,
				limit,
			},
		};
	}

	/**
	 * Get my reports (Current user)
	 */
	async getMyReports(userId: string, query: QueryReportDto) {
		const { level, status, from, to, limit = 10, page = 1 } = query;

		const filter: any = {
			created_by: userId,
		};

		if (level) {
			filter.alertLevel = parseInt(level);
		}

		if (status) {
			filter.status = status;
		}

		if (from || to) {
			filter.created_at = {};
			if (from) {
				filter.created_at.$gte = new Date(from);
			}
			if (to) {
				filter.created_at.$lte = new Date(to);
			}
		}

		const skip = (page - 1) * limit;
		const { items, total } = await this.reportRepository.findAll(
			filter,
			skip,
			limit,
		);

		// Get timelines for all reports
		const reportIds = items.map((item) => (item._id as any).toString());
		const timelineMap = await this.getStatusTimelinesForReports(reportIds);

		// Add timeline to each report
		const itemsWithTimeline = items.map((item: any) => {
			const reportId = item._id.toString();
			return {
				...item.toObject(),
				statusTimeline: timelineMap[reportId] || [],
			};
		});

		return {
			ok: true,
			data: itemsWithTimeline,
			meta: {
				total,
				page,
				limit,
			},
		};
	}

	/**
	 * Get organization reports (Organization users)
	 */
	async getOrganizationReports(organizationId: string, query: QueryReportDto) {
		const { level, status, from, to, limit = 10, page = 1 } = query;

		const filter: any = {
			organizationId: new mongoose.Types.ObjectId(organizationId),
		};

		if (level) {
			filter.alertLevel = parseInt(level);
		}

		if (status) {
			filter.status = status;
		}

		if (from || to) {
			filter.created_at = {};
			if (from) {
				filter.created_at.$gte = new Date(from);
			}
			if (to) {
				filter.created_at.$lte = new Date(to);
			}
		}

		const skip = (page - 1) * limit;
		const { items, total } = await this.reportRepository.findAll(
			filter,
			skip,
			limit,
		);

		// Get timelines for all reports
		const reportIds = items.map((item) => (item._id as any).toString());
		const timelineMap = await this.getStatusTimelinesForReports(reportIds);

		// Add timeline to each report
		const itemsWithTimeline = items.map((item: any) => {
			const reportId = item._id.toString();
			return {
				...item.toObject(),
				statusTimeline: timelineMap[reportId] || [],
			};
		});

		return {
			ok: true,
			data: itemsWithTimeline,
			meta: {
				total,
				page,
				limit,
			},
		};
	}

	async updateReportStatus(
		id: string,
		updateStatusDto: UpdateReportStatusDto,
		userId?: string,
		userOrgId?: string,
	) {
		const report = await this.reportRepository.findById(id);

		if (!report) {
			throw new NotFoundException('Báo cáo không tồn tại');
		}

		if (
			userOrgId &&
			userOrgId.toString() !== this.getObjectIdString(report.organizationId)
		) {
			throw new ForbiddenException('Bạn không có quyền cập nhật báo cáo này');
		}

		const oldStatus = report.status;
		const updatedReport = await this.reportRepository.update(id, {
			status: updateStatusDto.status,
		});

		// Save status change to history
		await this.statusHistoryRepository.create({
			reportId: new mongoose.Types.ObjectId(id),
			oldStatus: oldStatus,
			newStatus: updateStatusDto.status,
			changedBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
			note: updateStatusDto.note,
			changedAt: new Date(),
		});

		this.sendStatusUpdateEmail(updatedReport, oldStatus).catch((error) => {
			console.error('Failed to send status update email:', error);
		});

		return {
			ok: true,
			updated: {
				id: updatedReport._id.toString(),
				status: updatedReport.status,
			},
		};
	}

	/**
	 * Update evidence for a report (Only report creator can update)
	 */
	async updateEvidence(
		id: string,
		updateEvidenceDto: UpdateEvidenceDto,
		userId?: string,
	) {
		const report = await this.reportRepository.findById(id);

		if (!report) {
			throw new NotFoundException('Báo cáo không tồn tại');
		}

		// Check if the user is the creator of the report
		if (
			report.created_by &&
			report.created_by.toString() !== userId?.toString()
		) {
			throw new ForbiddenException(
				'Chỉ người tạo báo cáo mới có quyền cập nhật bằng chứng',
			);
		}

		const oldEvidenceUrls = report.evidenceUrl || [];
		const hasEvidence = updateEvidenceDto.evidenceUrls.length > 0;

		// Update report with new evidence
		const updatedReport = await this.reportRepository.update(id, {
			evidenceUrl: [...oldEvidenceUrls, ...updateEvidenceDto.evidenceUrls],
			hasEvidence,
		});

		// Save evidence update to history
		await this.statusHistoryRepository.create({
			reportId: new mongoose.Types.ObjectId(id),
			oldStatus: `Evidence: ${oldEvidenceUrls.length} file(s)`,
			newStatus: `Evidence: ${updateEvidenceDto.evidenceUrls.length} file(s)`,
			changedBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
			note: updateEvidenceDto.note || 'Cập nhật bằng chứng',
			changedAt: new Date(),
		});

		return {
			ok: true,
			updated: {
				id: updatedReport._id.toString(),
				evidenceUrl: updatedReport.evidenceUrl,
				hasEvidence: updatedReport.hasEvidence,
			},
		};
	}

	/**
	 * Update additional details for a report
	 */
	async updateAdditionalDetails(
		id: string,
		updateAdditionalDetailsDto: any,
		userId?: string,
		userOrgId?: string,
	) {
		const report = await this.reportRepository.findById(id);

		if (!report) {
			throw new NotFoundException('Báo cáo không tồn tại');
		}

		if (userId.toString() !== report.created_by.toString()) {
			throw new ForbiddenException('Bạn không có quyền cập nhật báo cáo này');
		}

		const updatedReport = await this.reportRepository.update(id, {
			additional_details: updateAdditionalDetailsDto.additional_details,
		});

		await this.statusHistoryRepository.create({
			reportId: new mongoose.Types.ObjectId(id),
			oldStatus: 'Update Details',
			newStatus: 'Update Details',
			changedBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
			note: updateAdditionalDetailsDto.note || 'Cập nhật thông tin chi tiết',
			changedAt: new Date(),
		});

		return {
			ok: true,
			updated: {
				id: updatedReport._id.toString(),
				additional_details: updatedReport.additional_details,
			},
		};
	}

	/**
	 * Send status update email notification
	 */
	private async sendStatusUpdateEmail(
		report: any,
		oldStatus: string,
	): Promise<void> {
		try {
			// TODO: Implement logic to get relevant recipients
			// For now, we'll get recipients based on alert level
			const organizationId = this.getObjectIdString(report.organizationId);
			const organizationName = this.getOrganizationName(report.organizationId);

			const recipientEmails = await this.getRecipientEmails(
				report.alertLevel,
				organizationId,
			);

			if (recipientEmails.length === 0) {
				console.warn('No recipient emails found for status update');
				return;
			}

			const success = await this.mailService.sendReportStatusUpdate(
				recipientEmails,
				report._id.toString(),
				oldStatus,
				report.status,
				organizationName,
			);

			if (success) {
				console.log(`Status update email sent for report ${report._id}`);
			}
		} catch (error) {
			console.error('Error sending status update email:', error);
		}
	}

	async getEmergencyLogs(query: QueryEmergencyContactDto) {
		const { reportId, from, to, limit = 10, page = 1 } = query;

		const filter: any = {};

		if (reportId) {
			filter.reportId = new mongoose.Types.ObjectId(reportId);
		}

		if (from || to) {
			filter.created_at = {};
			if (from) {
				filter.created_at.$gte = new Date(from);
			}
			if (to) {
				filter.created_at.$lte = new Date(to);
			}
		}

		const skip = (page - 1) * limit;
		const { items, total } = await this.reportRepository.findAll(
			filter,
			skip,
			limit,
		);

		return {
			ok: true,
			data: items,
			meta: {
				total,
				page,
				limit,
			},
		};
	}

	/**
	 * Emergency Contacts Management
	 */
	async createEmergencyContact(createDto: CreateEmergencyContactDto) {
		const contact = await this.emergencyContactRepository.create({
			name: createDto.name,
			phoneNumber: createDto.phoneNumber,
			email: createDto.email,
			role: createDto.role,
			organizationId: createDto.organizationId
				? new mongoose.Types.ObjectId(createDto.organizationId)
				: null,
			isActive: true,
		});

		return {
			ok: true,
			data: contact,
		};
	}

	async getEmergencyContacts(organizationId?: string) {
		let contacts;
		if (organizationId) {
			// For organization users, get both org-specific and global contacts
			contacts =
				await this.emergencyContactRepository.findByOrganization(
					organizationId,
				);
		} else {
			// For admin, get only global contacts
			contacts = await this.emergencyContactRepository.findGlobalContacts();
		}

		return {
			ok: true,
			data: contacts,
		};
	}

	async updateEmergencyContact(
		id: string,
		updateDto: UpdateEmergencyContactDto,
	) {
		const updateData: any = { ...updateDto };
		if (updateDto.organizationId) {
			updateData.organizationId = new mongoose.Types.ObjectId(
				updateDto.organizationId,
			);
		}
		const updated = await this.emergencyContactRepository.update(
			id,
			updateData,
		);

		return {
			ok: true,
			data: updated,
		};
	}

	async deleteEmergencyContact(id: string) {
		await this.emergencyContactRepository.delete(id);

		return {
			ok: true,
			message: 'Đã xóa liên hệ khẩn cấp',
		};
	}
}
