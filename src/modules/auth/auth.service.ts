import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
	BadRequestException,
	ConflictException,
	ConsoleLogger,
	HttpException,
	HttpStatus,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { StudentsService } from '@modules/students/students.service';

// INNER
import { SignUpDto, SignUpGoogleDto } from './dto/sign-up.dto';

// OUTER
import { TokenPayload } from './interfaces/token.interface';
import {
	access_token_private_key,
	refresh_token_private_key,
} from 'src/constraints/jwt.constraint';
import { ERRORS_DICTIONARY } from 'src/constraints/error-dictionary.constraint';
import { SignUpWithStudentDto } from './dto/sign-up-with-student.dto';
import { AdminService } from '@modules/admin/admin.service';
import { SignUpWithCitizenDto } from './dto/sign-up-with-citizen.dto';
import { CitizensService } from '@modules/citizens/citizens.service';
import { MailerService } from '@nestjs-modules/mailer';
import { SignInTokenDto } from './dto/sign-in-token.dto';
import { SupervisorsService } from '@modules/supervisors/supervisors.service';
import { SignInDto } from './dto/sign-in.dto';
import { ManagerService } from '@modules/manager/manager.service';
import { ResetTokenService } from '@modules/reset-token/reset-token.service';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import * as fs from 'fs';
import { ProvinceVisitService } from '@modules/province-vist/province-vist.service';
import { OrganizationsService } from '@modules/organizations/organizations.service';
import mongoose from 'mongoose';

@Injectable()
export class AuthService {
	private SALT_ROUND = 11;
	constructor(
		private config_service: ConfigService,
		private readonly admin_service: AdminService,
		private readonly student_service: StudentsService,
		private readonly citizen_service: CitizensService,
		private readonly jwt_service: JwtService,
		private readonly mailer_service: MailerService,
		private readonly supervisor_service: SupervisorsService,
		private readonly manager_service: ManagerService,
		private readonly resetTokenService: ResetTokenService,
		private readonly provinceVisitService: ProvinceVisitService,
		private readonly organizationService: OrganizationsService,
	) {}
	generateAccessToken(payload: TokenPayload) {
		return this.jwt_service.sign(payload, {
			algorithm: 'RS256',
			privateKey: access_token_private_key,
			expiresIn: `${this.config_service.get<string>(
				'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
			)}s`,
		});
	}

	generateRefreshToken(payload: TokenPayload) {
		return this.jwt_service.sign(payload, {
			algorithm: 'RS256',
			privateKey: refresh_token_private_key,
			expiresIn: `${this.config_service.get<string>(
				'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
			)}s`,
		});
	}

	async authenticateWithGoogle(sign_in_token: SignInTokenDto) {
		try {
			const { token, avatar } = sign_in_token;
			const decodedToken = this.jwt_service.decode(token) as { email: string };

			if (!decodedToken || !decodedToken.email) {
				throw new HttpException(
					{ message: 'Invalid token', error: 'Bad Request' },
					HttpStatus.BAD_REQUEST,
				);
			}

			const email = decodedToken.email;

			const results = await Promise.allSettled([
				this.admin_service.getAdminByEmail(email),
				this.supervisor_service.findOneByCondition({ email }),
				this.manager_service.findOneByCondition(
					{ email },
					{ populate: 'organizationId' },
				),
			]);

			const admin = results[0].status === 'fulfilled' ? results[0].value : null;
			const supervisor =
				results[1].status === 'fulfilled' ? results[1].value : null;
			const manager: any =
				results[2].status === 'fulfilled' ? results[2].value : null;

			let user = null;
			let role = '';
			let fullName = '';
			let organizationId = null;

			if (admin) {
				if (!admin.isActive) {
					throw new HttpException(
						{ message: 'Tài khoản admin đã bị khóa', error: 'Unauthorized' },
						HttpStatus.UNAUTHORIZED,
					);
				}
				user = admin;
				role = 'Admin';
				fullName = `${admin.first_name} ${admin.last_name}`;

				if (avatar && admin.avatar_url !== avatar) {
					await this.admin_service.update(admin.id, { avatar_url: avatar });
				}
			} else if (supervisor) {
				if (!supervisor.isActive) {
					throw new HttpException(
						{
							message: 'Tài khoản supervisor đã bị khóa',
							error: 'Unauthorized',
						},
						HttpStatus.UNAUTHORIZED,
					);
				}
				user = supervisor;
				role = 'Supervisor';
				fullName = `${supervisor.first_name} ${supervisor.last_name}`;

				if (avatar && supervisor.avatar !== avatar) {
					await this.supervisor_service.update(supervisor.id, {
						avatar_url: avatar,
					});
				}
			} else if (manager) {
				if (!manager.isActive) {
					throw new HttpException(
						{ message: 'Tài khoản manager đã bị khóa', error: 'Unauthorized' },
						HttpStatus.UNAUTHORIZED,
					);
				}
				user = manager;
				role = 'Manager';
				organizationId = manager.organizationId?.at(0)?._id.toString();
				fullName = `${manager.first_name} ${manager.last_name}`;

				if (avatar && manager.avatar !== avatar) {
					await this.manager_service.updateImage(manager.id, avatar);
				}
			} else {
				throw new HttpException(
					{
						message: 'Không tìm thấy người dùng phù hợp',
						error: 'Unauthorized',
					},
					HttpStatus.UNAUTHORIZED,
				);
			}

			const accessToken = this.generateAccessToken({
				userId: user.id,
				...(role === 'Manager' && {
					organizationId,
				}),
				role,
			});

			const refreshToken = this.generateRefreshToken({
				userId: user.id,
				...(role === 'Manager' && { organizationId }),
				role,
			});

			return {
				accessToken,
				refreshToken,
				fullName,
				role,
				...(role === 'Manager' && {
					organizations: Array.isArray(manager.organizationId)
						? manager.organizationId
						: [],
				}),
			};
		} catch (error) {
			throw new BadRequestException({
				statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
				error: error.message,
				message: 'Có lỗi xảy ra, vui lòng thử lại sau',
			});
		}
	}

	// async getUserIfRefreshTokenMatched(
	// 	user_id: string,
	// 	refresh_token: string,
	// ): Promise<User> {
	// 	try {
	// 		const user = await this.users_service.findOneByCondition({
	// 			_id: user_id,
	// 		});
	// 		if (!user) {
	// 			throw new UnauthorizedException({
	// 				message: ERRORS_DICTIONARY.UNAUTHORIZED_EXCEPTION,
	// 				details: 'Unauthorized',
	// 			});
	// 		}
	// 		await this.verifyPlainContentWithHashedContent(
	// 			refresh_token,
	// 			user.current_refresh_token,
	// 		);
	// 		return user;
	// 	} catch (error) {
	// 		throw error;
	// 	}
	// }

	async storeRefreshTokenForStudent(_id: string, token: string): Promise<void> {
		try {
			const hashed_token = await bcrypt.hash(token, this.SALT_ROUND);
			await this.student_service.setCurrentRefreshToken(_id, hashed_token);
		} catch (error) {
			throw error;
		}
	}

	async storeRefreshTokenForCitizen(_id: string, token: string): Promise<void> {
		try {
			const hashed_token = await bcrypt.hash(token, this.SALT_ROUND);
			await this.citizen_service.setCurrentRefreshToken(_id, hashed_token);
		} catch (error) {
			throw error;
		}
	}

	async signIn(sign_in_dto: SignInDto) {
		const { username, password } = sign_in_dto;
		const normalizedUsername = username.toLowerCase();
		const [existed_student_username, existed_citizen_username] =
			await Promise.all([
				await this.student_service.findOneByCondition(
					{ username: { $regex: `^${normalizedUsername}$`, $options: 'i' } },
					'sign-in',
				),
				await this.citizen_service.findOneByCondition(
					{ username: { $regex: `^${normalizedUsername}$`, $options: 'i' } },
					'sign-in',
				),
			]);

		if (existed_student_username) {
			const is_password_matched = await bcrypt.compare(
				password,
				existed_student_username.password,
			);

			if (!existed_student_username.isActive)
				throw new BadRequestException({
					message: ERRORS_DICTIONARY.USER_NOT_ACTIVE,
					details: 'User not active',
				});

			if (!is_password_matched) {
				throw new BadRequestException({
					message: ERRORS_DICTIONARY.PASSWORD_NOT_MATCHED,
					details: 'Password not matched',
				});
			}
			const refresh_token = this.generateRefreshToken({
				userId: existed_student_username._id.toString(),
				role: 'Student',
			});
			await this.storeRefreshTokenForStudent(
				existed_student_username._id.toString(),
				refresh_token,
			);

			if (existed_student_username.organizationId) {
				const studentOrganization = await this.organizationService.findOneById(
					existed_student_username.organizationId._id.toString(),
				);
				await this.provinceVisitService.increaseVisit(
					studentOrganization.province_id._id.toString(),
				);
			}
			return {
				access_token: this.generateAccessToken({
					userId: existed_student_username._id.toString(),
					role: 'Student',
				}),
				refresh_token,
			};
		} else if (existed_citizen_username) {
			const is_password_matched = await bcrypt.compare(
				password,
				existed_citizen_username.password,
			);
			if (!is_password_matched) {
				throw new BadRequestException({
					message: ERRORS_DICTIONARY.PASSWORD_NOT_MATCHED,
					details: 'Password not matched',
				});
			}

			if (!existed_citizen_username.isActive)
				throw new BadRequestException({
					message: ERRORS_DICTIONARY.USER_NOT_ACTIVE,
					details: 'User not active',
				});

			const refresh_token = this.generateRefreshToken({
				userId: existed_citizen_username._id.toString(),
				role: 'Citizen',
			});
			await this.storeRefreshTokenForCitizen(
				existed_citizen_username._id.toString(),
				refresh_token,
			);

			if (
				Array.isArray(existed_citizen_username.province) &&
				existed_citizen_username.province.length > 0
			) {
				await this.provinceVisitService.increaseVisit(
					existed_citizen_username.province[0].toString(),
				);
			}
			return {
				access_token: this.generateAccessToken({
					userId: existed_citizen_username._id.toString(),
					role: 'Citizen',
				}),
				refresh_token,
			};
		}
		throw new BadRequestException({
			message: ERRORS_DICTIONARY.USER_NOT_FOUND,
			details: 'Username not found',
		});
	}

	async signUpWithStudent(sign_up_with_std_dto: SignUpWithStudentDto) {
		try {
			const {
				first_name,
				last_name,
				phone_number,
				organizationId,
				username,
				email,
				date_of_birth,
				password,
			} = sign_up_with_std_dto;
			const normalizedUsername = username.toLowerCase();
			const student = await this.student_service.create({
				first_name,
				last_name,
				date_of_birth,
				phone_number,
				email,
				username: normalizedUsername,
				password,
				organizationId,
			});

			const refresh_token = this.generateRefreshToken({
				userId: student._id.toString(),
				role: 'Student',
			});
			try {
				await this.storeRefreshTokenForStudent(
					student._id.toString(),
					refresh_token,
				);
				return {
					access_token: this.generateAccessToken({
						userId: student._id.toString(),
						role: 'Student',
					}),
					refresh_token,
				};
			} catch (error) {
				console.error(
					'Error storing refresh token or generating access token:',
					error,
				);
				throw new Error(
					'An error occurred while processing tokens. Please try again.',
				);
			}
		} catch (error) {
			throw error;
		}
	}

	async signUpWithCitizen(sign_up_with_citizen_dto: SignUpWithCitizenDto) {
		try {
			const {
				first_name,
				last_name,
				phone_number,
				province,
				email,
				username,
				password,
			} = sign_up_with_citizen_dto;

			const citizen = await this.citizen_service.create({
				first_name,
				last_name,
				phone_number,
				province,
				username,
				email,
				password,
			});

			const refresh_token = this.generateRefreshToken({
				userId: citizen._id.toString(),
				role: 'Citizen',
			});
			try {
				await this.citizen_service.setCurrentRefreshToken(
					citizen._id.toString(),
					refresh_token,
				);
				return {
					access_token: this.generateAccessToken({
						userId: citizen._id.toString(),
						role: 'Citizen',
					}),
					refresh_token,
				};
			} catch (error) {
				console.error(
					'Error storing refresh token or generating access token:',
					error,
				);
				throw new Error(
					'An error occurred while processing tokens. Please try again.',
				);
			}
		} catch (error) {
			throw error;
		}
	}

	async sendOtp(phone_number: string): Promise<any> {
		return {
			statusCode: HttpStatus.OK,
			message: `OTP đã được gửi tới sđt ${phone_number} thành công`,
		};
	}
	async verifyOTP(phone_number: string, otp: string) {
		try {
			const [student, citizen] = await Promise.all([
				await this.student_service.findOneByCondition(
					{ phone_number },
					'sign-in',
				),
				await this.citizen_service.findOneByCondition(
					{ phone_number },
					'sign-in',
				),
			]);

			if (otp == '000000') {
				if (student) {
					const access_token = this.generateAccessToken({
						userId: student._id.toString(),
						role: 'Student',
					});
					const refresh_token = this.generateRefreshToken({
						userId: student._id.toString(),
						role: 'Student',
					});
					await this.storeRefreshTokenForStudent(student.id, refresh_token);
					return {
						access_token,
						refresh_token,
					};
				} else if (citizen) {
					const access_token = this.generateAccessToken({
						userId: citizen._id.toString(),
						role: 'Citizen',
					});
					const refresh_token = this.generateRefreshToken({
						userId: citizen._id.toString(),
						role: 'Citizen',
					});
					await this.storeRefreshTokenForStudent(citizen.id, refresh_token);
					return {
						access_token,
						refresh_token,
					};
				} else {
					throw new BadRequestException({
						message: ERRORS_DICTIONARY.USER_NOT_FOUND,
						details: 'User not found!!',
					});
				}
			} else {
				throw new HttpException(
					{
						status: 'error',
						message: 'Invalid OTP',
					},
					HttpStatus.BAD_REQUEST,
				);
			}
		} catch (error) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message: 'Có lỗi xảy ra khi xác nhận OTP, vui lòng thử lại sau',
				details: `Có lỗi xảy ra ${error.message}`,
			});
		}
	}

	sendMail(): void {
		this.mailer_service.sendMail({
			to: 'monkeyold113@gmail.com',
			from: 'baopqtde181053@fpt.edu.vn',
			subject: 'Verify email',
			text: 'hello',
			html: '<b>Welcome to Safe Edu</b>',
		});
	}
	async getAccessToken(user: TokenPayload): Promise<{
		access_token: string;
		refresh_token: string;
	}> {
		const { userId, role, organizationId } = user;
		const access_token = this.generateAccessToken({
			userId,
			role,
			...(role === 'Manager' && { organizationId }),
		});
		const refresh_token = this.generateRefreshToken({
			userId,
			role,
			...(role === 'Manager' && { organizationId }),
		});
		return {
			access_token,
			refresh_token,
		};
	}

	async authInWithGoogle(sign_up_dto: SignUpGoogleDto) {
		try {
			const results = await Promise.allSettled([
				this.admin_service.findOneByCondition({ email: sign_up_dto.email }),
				this.supervisor_service.findOneByCondition({
					email: sign_up_dto.email,
				}),
				this.manager_service.findOneByCondition(
					{ email: sign_up_dto.email },
					{ populate: 'organizationId' },
				),
			]);

			const admin = results[0].status === 'fulfilled' ? results[0].value : null;
			const supervisor =
				results[1].status === 'fulfilled' ? results[1].value : null;
			const manager =
				results[2].status === 'fulfilled' ? results[2].value : null;
			if (admin) {
				return await this.signInAdmin(admin._id.toString());
			}
			if (supervisor) {
				return await this.signInSupervisor(supervisor._id.toString());
			}
			if (manager) {
				return await this.signInManager(manager._id.toString());
			}
			throw new Error('User is not an admin or supervisor');
		} catch (error) {
			console.error('Auth error:', error);
			throw error;
		}
	}

	async signInAdmin(_id: string) {
		const admin = await this.admin_service.findOneByCondition({ _id });
		if (admin) {
			const access_token = this.generateAccessToken({
				userId: admin._id.toString(),
				role: 'Admin',
			});
			const refresh_token = this.generateRefreshToken({
				userId: admin._id.toString(),
				role: 'admin',
			});

			return {
				access_token,
				refresh_token,
			};
		}
	}

	async signInManager(_id: string) {
		const manager = await this.manager_service.findOneByCondition(
			{ _id },
			{ populate: 'organizationId' }, // <--- thêm dòng này nếu hỗ trợ
		);

		if (manager) {
			const access_token = this.generateAccessToken({
				userId: manager._id.toString(),
				role: 'Manager',
			});
			const refresh_token = this.generateRefreshToken({
				userId: manager._id.toString(),
				role: 'manager',
			});

			return {
				access_token,
				refresh_token,
				organizations: manager.organizationId, // full organization info
			};
		}
	}

	async signInSupervisor(_id: string) {
		const supervisor = await this.supervisor_service.findOneByCondition({
			_id,
		});
		if (supervisor) {
			const access_token = this.generateAccessToken({
				userId: supervisor._id.toString(),
				role: 'supervisor',
			});
			const refresh_token = this.generateRefreshToken({
				userId: supervisor._id.toString(),
				role: 'supervisor',
			});

			return {
				access_token,
				refresh_token,
			};
		}
	}

	async forgotPassword(email: string) {
		try {
			const results = await Promise.allSettled([
				this.citizen_service.findOneByCondition(
					{
						email: email,
					},
					'forgot-password',
				),
				this.student_service.findOneByCondition(
					{
						email: email,
					},
					'forgot-password',
				),
			]);
			if (!results) {
				throw new BadRequestException({
					statusCode: HttpStatus.BAD_REQUEST,
					message: ERRORS_DICTIONARY.USER_NOT_FOUND,
					details: 'Không tìm thấy người dùng',
				});
			}
			const otp = Math.floor(100000 + Math.random() * 900000).toString();

			await this.resetTokenService.createOtp({ email, otp });

			const templatePath = path.join(
				process.cwd(),
				'src/templates/send-otp-template.html',
			);

			let emailTemplate = await fs.readFileSync(templatePath, 'utf-8');
			emailTemplate = emailTemplate.replace('{{Email}}', email);
			emailTemplate = emailTemplate.replace('{{otp_code}}', otp);

			const transporter = nodemailer.createTransport({
				service: 'gmail',
				auth: {
					user: 'safeedushared@gmail.com',
					pass: 'rjif qqcy osej algo',
				},
			});

			await transporter.sendMail({
				from: 'Safe Edu <safeedushared@gmail.com>',
				to: email,
				subject: 'Đặt lại mật khẩu',
				html: emailTemplate,
			});

			return {
				statusCode: HttpStatus.CREATED,
				message: 'Email đã được gửi thành công',
				result: email,
			};
		} catch (error) {
			throw new HttpException(
				{
					statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
					message:
						'Có lỗi xảy ra quên mật khẩu vui lòng thử lại sau, ${error.message}',
				},
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async verifyOtp(otp: string, email: string): Promise<boolean> {
		try {
			const validOtp = await this.resetTokenService.findValidOtp(otp);
			if (!validOtp) {
				throw new BadRequestException({
					message: 'OTP không hợp lệ hoặc đã hết hạn',
					details: 'OTP is invalid or expired',
				});
			}

			if (validOtp.email !== email) {
				throw new BadRequestException({
					message: 'Email không hợp lệ',
					details: 'Invalid email',
				});
			}
			return true;
		} catch (error) {
			throw new HttpException(
				{
					statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
					error: error.message,
					message: 'Failed to verify OTP',
				},
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async resetPassword(otp: string, newPassword: string) {
		try {
			const validOtp = await this.resetTokenService.findValidOtp(otp);
			if (!validOtp) {
				throw new BadRequestException({
					statusCode: HttpStatus.BAD_REQUEST,
					message: 'OTP không hợp lệ hoặc đã hết hạn',
				});
			}
			const hashedPassword = await bcrypt.hash(newPassword, 10);
			const results = await Promise.allSettled([
				this.citizen_service.findOneByCondition(
					{
						email: validOtp.email,
					},
					'forgot-password',
				),
				this.student_service.findOneByCondition(
					{
						email: validOtp.email,
					},
					'forgot-password',
				),
			]);
			const citizen =
				results[0].status === 'fulfilled' ? results[0].value : null;
			const student =
				results[1].status === 'fulfilled' ? results[1].value : null;
			if (citizen) {
				await this.citizen_service.update(citizen._id.toString(), {
					password: hashedPassword,
				});
				await this.resetTokenService.deleteOtp(otp);
			}
			if (student) {
				await this.student_service.update(student._id.toString(), {
					password: hashedPassword,
				});
				await this.resetTokenService.deleteOtp(otp);
			}

			return {
				statusCode: HttpStatus.CREATED,
				message: 'Mật khẩu đã được thay đổi thành công.',
			};
		} catch (error) {
			throw new HttpException(
				{
					statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
					error: error.message,
					message: 'Có lỗi xảy ra khi đặt lại mật khẩu, vui lòng thử lại sau.',
				},
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}
}
