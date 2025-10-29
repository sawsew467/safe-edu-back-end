import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
	SchoolViolenceReportsController,
	SchoolViolenceReportsOrganizationController,
	EmergencyContactsController,
	EmergencyLogsController,
} from './school-violence-reports.controller';
import { SchoolViolenceReportsService } from './school-violence-reports.service';
import { Report, ReportSchema } from './entities/report.entity';
import { ReportStatusHistory, ReportStatusHistorySchema } from './entities/report-status-history.entity';
import { ReportRepository } from '@repositories/report.repository';
import { ReportStatusHistoryRepository } from '@repositories/report-status-history.repository';
import { AwsS3Service } from 'src/services/aws-s3.service';
import { GeneratorService } from 'src/services/generator.service';
import { MailModule } from '@modules/mail/mail.module';
import {
	EmergencyContact,
	EmergencyContactSchema,
} from './entities/emergency-contact.entity';
import { EmergencyContactRepository } from '@repositories/emergency-contact.repository';
import { StudentsModule } from '@modules/students/students.module';
import { CitizensModule } from '@modules/citizens/citizens.module';
import { OrganizationsModule } from '@modules/organizations/organizations.module';
import { AdminModule } from '@modules/admin/admin.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Report.name, schema: ReportSchema },
			{ name: EmergencyContact.name, schema: EmergencyContactSchema },
			{ name: ReportStatusHistory.name, schema: ReportStatusHistorySchema },
		]),
		MailModule,
		StudentsModule,
		CitizensModule,
		OrganizationsModule,
		AdminModule,
	],
	controllers: [
		SchoolViolenceReportsController,
		SchoolViolenceReportsOrganizationController,
		EmergencyContactsController,
		EmergencyLogsController,
	],
	providers: [
		SchoolViolenceReportsService,
		{
			provide: 'ReportRepositoryInterface',
			useClass: ReportRepository,
		},
		{
			provide: 'EmergencyContactRepositoryInterface',
			useClass: EmergencyContactRepository,
		},
		{
			provide: 'ReportStatusHistoryRepositoryInterface',
			useClass: ReportStatusHistoryRepository,
		},
		AwsS3Service,
		GeneratorService,
	],
	exports: [SchoolViolenceReportsService],
})
export class SchoolViolenceReportsModule {}
