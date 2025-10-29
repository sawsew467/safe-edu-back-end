import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

export interface ReportEmailData {
	reportId: string;
	victimName: string;
	classGrade?: string;
	impactLevel: string;
	currentSituation: string;
	alertLevel: number;
	timeOfIncident: string; // Time option, not actual date
	organizationName: string;
	violenceTypes?: string[];
}

// Translation maps
const TRANSLATIONS = {
	violenceTypes: {
		'Physical violence': 'Bạo lực thể chất',
		'Verbal abuse': 'Bạo lực lời nói',
		'Emotional or social isolation': 'Bạo lực tinh thần / cô lập',
		Cyberbullying: 'Bạo lực mạng',
		Other: 'Hành vi khác',
	},
	impactLevel: {
		Mild: 'Nhẹ – chưa gây tổn thương rõ',
		Moderate: 'Trung bình – có tổn thương tinh thần / xô xát nhẹ',
		Severe: 'Nghiêm trọng – gây thương tích, tổn thương kéo dài',
	},
	currentSituation: {
		Ended: 'Đã chấm dứt',
		'Still happening': 'Vẫn đang diễn ra',
		Escalating: 'Có dấu hiệu leo thang',
	},
	gender: {
		Male: 'Nam',
		Female: 'Nữ',
		Other: 'Khác',
	},
	relationship: {
		'I am the victim': 'Tôi là người bị bạo lực (nạn nhân)',
		'Same class': 'Là bạn cùng lớp',
		'Same school': 'Là bạn cùng trường',
		'Only online': 'Chỉ biết qua mạng xã hội',
		Other: 'Khác',
	},
	location: {
		'In classroom': 'Trong lớp học',
		'On campus': 'Trong khuôn viên trường',
		'Outside school': 'Ngoài trường',
	},
	timeOfIncident: {
		Today: 'Hôm nay',
		'This week': 'Trong tuần này',
		'Over a week ago': 'Hơn 1 tuần trước',
		'Not sure': 'Không nhớ rõ',
	},
	reliability: {
		Certain: 'Chắc chắn',
		'Likely true': 'Có khả năng đúng',
		'Needs verification': 'Cần xác minh thêm',
	},
	informationSources: {
		'I am the victim (self-report)':
			'Tôi là người bị bạo lực (nạn nhân tự phản ánh)',
		'Witnessed directly': 'Tôi chứng kiến trực tiếp',
		'Told by victim': 'Nạn nhân kể lại',
		'Told by someone else': 'Người khác kể lại',
		'Seen on social media': 'Thấy trên mạng xã hội',
	},
};

@Injectable()
export class MailService {
	private transporter: nodemailer.Transporter;

	constructor(private readonly configService: ConfigService) {
		this.transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: this.configService.get<string>('MAIL_USER'),
				pass: this.configService.get<string>('MAIL_PASS'),
			},
		});
	}

	/**
	 * Translate English values to Vietnamese
	 */
	private translate(
		category: keyof typeof TRANSLATIONS,
		value: string,
	): string {
		return TRANSLATIONS[category][value] || value;
	}

	/**
	 * Translate array of violence types
	 */
	private translateViolenceTypes(types: string[]): string {
		if (!types || types.length === 0) return 'Không xác định';
		return types
			.map((type) => this.translate('violenceTypes', type))
			.join(', ');
	}

	/**
	 * Đọc và compile Handlebars template
	 */
	private async loadTemplate(
		templateName: string,
	): Promise<HandlebarsTemplateDelegate> {
		const templatePath = path.join(
			process.cwd(),
			'src/modules/mail/templates',
			`${templateName}.hbs`,
		);

		const templateContent = await fs.promises.readFile(templatePath, 'utf-8');
		return Handlebars.compile(templateContent);
	}

	/**
	 * Get dashboard URL
	 */
	private getDashboardUrl(reportId: string): string {
		const baseUrl =
			this.configService.get<string>('APP_URL') || 'http://localhost:3000';
		return `${baseUrl}/quan-tri/bao-cao-bao-luc/${reportId}`;
	}


	private translateStatus(status: string): string {
		const statusMap: { [key: string]: string } = {
			Pending: 'Đang chờ xử lý',
			'In Progress': 'Đang xử lý',
			Resolved: 'Đã giải quyết',
			Rejected: 'Đã từ chối',
		};
		return statusMap[status] || 'Cập nhật Bằng chứng';
	}

	/**
	 * Gửi email Level 4 - Critical
	 */
	async sendLevel4CriticalAlert(
		recipientEmails: string[],
		reportData: ReportEmailData,
	): Promise<boolean> {
		try {
			const template = await this.loadTemplate('level-4-critical');
			const html = template({
				reportId: reportData.reportId,
				victimName: reportData.victimName,
				classGrade: reportData.classGrade,
				impactLevel: this.translate('impactLevel', reportData.impactLevel),
				currentSituation: this.translate(
					'currentSituation',
					reportData.currentSituation,
				),
				timeOfIncident: this.translate(
					'timeOfIncident',
					reportData.timeOfIncident,
				),
				organizationName: reportData.organizationName,
				violenceTypes: this.translateViolenceTypes(reportData.violenceTypes),
				dashboardUrl: this.getDashboardUrl(reportData.reportId),
			});

			await this.transporter.sendMail({
				from: `"SafeEdu" <${this.configService.get<string>('MAIL_FROM') || this.configService.get<string>('MAIL_USER')}>`,
				to: recipientEmails.join(', '),
				subject: `KHẨN CẤP - Báo cáo bạo lực học đường nghiêm trọng #${reportData.reportId}`,
				html,
			});

			return true;
		} catch (error) {
			console.error('Failed to send Level 4 critical alert:', error);
			return false;
		}
	}

	/**
	 * Gửi email Level 3 - High Priority
	 */
	async sendLevel3HighPriorityAlert(
		recipientEmails: string[],
		reportData: ReportEmailData,
	): Promise<boolean> {
		try {
			const template = await this.loadTemplate('level-3-high-priority');
			const html = template({
				reportId: reportData.reportId,
				victimName: reportData.victimName,
				classGrade: reportData.classGrade,
				impactLevel: this.translate('impactLevel', reportData.impactLevel),
				currentSituation: this.translate(
					'currentSituation',
					reportData.currentSituation,
				),
				timeOfIncident: this.translate(
					'timeOfIncident',
					reportData.timeOfIncident,
				),
				organizationName: reportData.organizationName,
				violenceTypes: this.translateViolenceTypes(reportData.violenceTypes),
				dashboardUrl: this.getDashboardUrl(reportData.reportId),
			});

			await this.transporter.sendMail({
				from: `"SafeEdu" <${this.configService.get<string>('MAIL_FROM') || this.configService.get<string>('MAIL_USER')}>`,
				to: recipientEmails.join(', '),
				subject: `CẢNH BÁO NGHIÊM TRỌNG - Báo cáo bạo lực học đường #${reportData.reportId}`,
				html,
			});

			return true;
		} catch (error) {
			console.error('Failed to send Level 3 high priority alert:', error);
			return false;
		}
	}

	/**
	 * Gửi email Level 2 - Warning
	 */
	async sendLevel2Warning(
		recipientEmails: string[],
		reportData: ReportEmailData,
	): Promise<boolean> {
		try {
			const template = await this.loadTemplate('level-2-warning');
			const html = template({
				reportId: reportData.reportId,
				impactLevel: this.translate('impactLevel', reportData.impactLevel),
				currentSituation: this.translate(
					'currentSituation',
					reportData.currentSituation,
				),
				timeOfIncident: this.translate(
					'timeOfIncident',
					reportData.timeOfIncident,
				),
				organizationName: reportData.organizationName,
				violenceTypes: this.translateViolenceTypes(reportData.violenceTypes),
				supportUrl: this.getDashboardUrl(reportData.reportId),
			});

			await this.transporter.sendMail({
				from: `"SafeEdu" <${this.configService.get<string>('MAIL_FROM') || this.configService.get<string>('MAIL_USER')}>`,
				to: recipientEmails.join(', '),
				subject: `Cảnh báo - Sự cố bạo lực học đường tại ${reportData.organizationName}`,
				html,
			});

			return true;
		} catch (error) {
			console.error('Failed to send Level 2 warning:', error);
			return false;
		}
	}

	/**
	 * Gửi email Level 1 - Information
	 */
	async sendLevel1Information(
		recipientEmails: string[],
		reportData: ReportEmailData,
	): Promise<boolean> {
		try {
			const template = await this.loadTemplate('level-1-information');
			const html = template({
				reportId: reportData.reportId,
				victimName: reportData.victimName,
				classGrade: reportData.classGrade,
				impactLevel: this.translate('impactLevel', reportData.impactLevel),
				currentSituation: this.translate(
					'currentSituation',
					reportData.currentSituation,
				),
				timeOfIncident: this.translate(
					'timeOfIncident',
					reportData.timeOfIncident,
				),
				organizationName: reportData.organizationName,
				dashboardUrl: this.getDashboardUrl(reportData.reportId),
			});

			await this.transporter.sendMail({
				from: `"SafeEdu" <${this.configService.get<string>('MAIL_FROM') || this.configService.get<string>('MAIL_USER')}>`,
				to: recipientEmails.join(', '),
				subject: `Thông báo - Báo cáo sự cố #${reportData.reportId}`,
				html,
			});

			return true;
		} catch (error) {
			console.error('Failed to send Level 1 information:', error);
			return false;
		}
	}

	/**
	 * Gửi email alert theo level
	 */
	async sendAlertByLevel(
		alertLevel: number,
		recipientEmails: string[],
		reportData: ReportEmailData,
	): Promise<boolean> {
		if (!recipientEmails || recipientEmails.length === 0) {
			return false;
		}

		switch (alertLevel) {
			case 4:
				return await this.sendLevel4CriticalAlert(recipientEmails, reportData);
			case 3:
				return await this.sendLevel3HighPriorityAlert(
					recipientEmails,
					reportData,
				);
			case 2:
				return await this.sendLevel2Warning(recipientEmails, reportData);
			case 1:
				return await this.sendLevel1Information(recipientEmails, reportData);
			default:
				console.error(`Invalid alert level: ${alertLevel}`);
				return false;
		}
	}

	/**
	 * Gửi email cập nhật trạng thái
	 */
	async sendReportStatusUpdate(
		recipientEmails: string[],
		reportId: string,
		oldStatus: string,
		newStatus: string,
		organizationName: string,
	): Promise<boolean> {
		try {
			const template = await this.loadTemplate('status-update');
			const html = template({
				reportId,
				oldStatus: this.translateStatus(oldStatus),
				newStatus: this.translateStatus(newStatus),
				organizationName,
				dashboardUrl: this.getDashboardUrl(reportId),
			});

			await this.transporter.sendMail({
				from: `"SafeEdu" <${this.configService.get<string>('MAIL_FROM') || this.configService.get<string>('MAIL_USER')}>`,
				to: recipientEmails.join(', '),
				subject: `Cập nhật trạng thái báo cáo #${reportId}`,
				html,
			});

			return true;
		} catch (error) {
			console.error('Failed to send status update email:', error);
			return false;
		}
	}

	/**
	 * Gửi OTP email (cho forgot password)
	 * Pattern giống forgotPassword trong auth.service.ts
	 */
	async sendOtpEmail(email: string, otp: string): Promise<boolean> {
		try {
			const templatePath = path.join(
				process.cwd(),
				'src/templates/send-otp-template.html',
			);

			let emailTemplate = await fs.promises.readFile(templatePath, 'utf-8');
			emailTemplate = emailTemplate.replace('{{Email}}', email);
			emailTemplate = emailTemplate.replace('{{otp_code}}', otp);

			await this.transporter.sendMail({
				from: `"Safe Edu" <${this.configService.get<string>('MAIL_FROM') || this.configService.get<string>('MAIL_USER')}>`,
				to: email,
				subject: 'Đặt lại mật khẩu',
				html: emailTemplate,
			});

			return true;
		} catch (error) {
			console.error('Failed to send OTP email:', error);
			return false;
		}
	}
}
