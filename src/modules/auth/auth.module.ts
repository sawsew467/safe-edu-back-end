// import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh-token.strategy';
import { JwtAccessTokenStrategy } from './strategies/jwt-access-token.strategy';
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh-token.strategy';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { GoogleStrategy } from './strategies/google.strategy';
import { Student } from '@modules/students/entities/student.entity';
import { StudentsModule } from '@modules/students/students.module';
import { AdminService } from '@modules/admin/admin.service';
import { StudentsService } from '@modules/students/students.service';
import { SupervisorsService } from '@modules/supervisors/supervisors.service';
import { OrganizationsModule } from '@modules/organizations/organizations.module';
import { AdminModule } from '@modules/admin/admin.module';
import { CitizensService } from '@modules/citizens/citizens.service';
import { CitizensModule } from '@modules/citizens/citizens.module';
import { HttpModule } from '@nestjs/axios';
import { MailerModule } from '@nestjs-modules/mailer';
import { SupervisorsModule } from '@modules/supervisors/supervisors.module';
import { Quiz } from '@modules/quiz/entities/quiz.entity';
import { QuizResultModule } from '@modules/quiz-result/quiz-result.module';
import { ManagerModule } from '@modules/manager/manager.module';
import { ResetTokenService } from '@modules/reset-token/reset-token.service';
import { ResetTokenModule } from '@modules/reset-token/reset-token.module';
import { ProvincesModule } from '@modules/provinces/provinces.module';
import { ProvinceVisitModule } from '@modules/province-vist/province-vist.module';
@Module({
	imports: [
		StudentsModule,
		AdminModule,
		PassportModule,
		CitizensModule,
		JwtModule.register({}),
		OrganizationsModule,
		CitizensModule,
		HttpModule,
		SupervisorsModule,
		QuizResultModule,
		ProvincesModule,
		SupervisorsModule,
		ManagerModule,
		ResetTokenModule,
		ProvinceVisitModule,
		MailerModule.forRoot({
			transport: {
				host: 'smtp.gmail.com',
				auth: {
					user: 'safeedushared@gmail.com',
					pass: 'rjif qqcy osej algo',
				},
			},
		}),
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		LocalStrategy,
		JwtAccessTokenStrategy,
		JwtRefreshTokenStrategy,
		GoogleStrategy,
		StudentsService,
		AdminService,
		SupervisorsService,
		CitizensService,
		SupervisorsService,
		ResetTokenService,
	],
})
export class AuthModule {}
