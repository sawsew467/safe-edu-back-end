import {
	BadRequestException,
	HttpStatus,
	Inject,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentsRepositoryInterface } from './interfaces/students.interface';
import { OrganizationsService } from '@modules/organizations/organizations.service';
import mongoose, { FilterQuery } from 'mongoose';
import { Student } from './entities/student.entity';
import { ERRORS_DICTIONARY } from 'src/constraints/error-dictionary.constraint';
import { CitizensRepositoryInterface } from '@modules/citizens/interfaces/citizens.interfaces';
import * as bcrypt from 'bcryptjs';
import { QuizResultService } from '@modules/quiz-result/quiz-result.service';
import { ChangePasswordDTO } from './dto/change-password';
import { Citizen } from '@modules/citizens/entities/citizen.entity';
import { omit } from 'lodash';
@Injectable()
export class StudentsService {

	private readonly SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10;
	constructor(
		@Inject('StudentsRepositoryInterface')
		private readonly studentsRepository: StudentsRepositoryInterface,
		private readonly organizationService: OrganizationsService,
		@Inject('CitizensRepositoryInterface')
		private readonly citizenRepository: CitizensRepositoryInterface,
		private readonly quizResultService: QuizResultService,
	) { }

	async setCurrentRefreshToken(
		_id: string,
		refreshToken: string,
	): Promise<void> {
		try {
			const student = await this.studentsRepository.findOneByCondition({ _id });
			if (!student) {
				throw new Error('User not found');
			}
			student.current_refresh_token = refreshToken;
			await this.studentsRepository.update(_id, {
				current_refresh_token: refreshToken,
			});
		} catch (error) {
			console.error(`Failed to set refresh token for user ${_id}:`, error);
			throw new Error('Failed to set refresh token');
		}
	}
	async create(createDto: CreateStudentDto): Promise<Student> {
		const {
			first_name,
			last_name,
			phone_number,
			date_of_birth,
			organizationId,
			password,
			username,
			email,
		} = createDto;
		const normalizedUsername = username.toLowerCase();
		// const existed_organization =
		// 	await this.organizationService.findOneById(organizationId);

		const [existed_phone_number_student, existed_phone_number_student_citizen] =
			await Promise.all([
				await this.studentsRepository.findOneByCondition({ phone_number }),
				await this.citizenRepository.findOneByCondition({ phone_number }),
			]);

		const [existed_student_username, existed_citizen_username] =
			await Promise.all([
				await this.studentsRepository.findOneByCondition({ username: { $regex: `^${normalizedUsername}$`, $options: 'i' } }),
				await this.citizenRepository.findOneByCondition({ username: { $regex: `^${normalizedUsername}$`, $options: 'i' } }),
			]);

		if (existed_student_username || existed_citizen_username) {
			throw new BadRequestException({
				message: ERRORS_DICTIONARY.USERNAME_EXISTS,
				details: 'username đã tồn tại',
			});
		}

		if (
			phone_number &&
			(existed_phone_number_student || existed_phone_number_student_citizen)
		) {
			throw new BadRequestException({
				message: ERRORS_DICTIONARY.STUDENT_PHONE_NUMBER_EXISTS,
				details: 'Phone number already exist',
			});
		}

		const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

		if (organizationId) {
			const student = await this.studentsRepository.create({
				first_name,
				last_name,
				date_of_birth,
				username: normalizedUsername,
				phone_number,
				password: hashedPassword,
				email,
				organizationId: new mongoose.Types.ObjectId(organizationId),
			});
			return student;
		}
		else {
			const student = await this.studentsRepository.create({
				first_name,
				last_name,
				date_of_birth,
				username: normalizedUsername,
				phone_number,
				password: hashedPassword,
				email,
			});
			return student;
		}
		
	}

	async findAll() {
		return await this.studentsRepository.findAll();
	}

	async findOne(_id: string) {
		return await this.studentsRepository.findOneByCondition({ _id });
	}
	async findOneByCondition(
		condition: FilterQuery<Student>,
		action: string,
	): Promise<Student | null> {
		const student = await this.studentsRepository.findOneByCondition(condition);
		if (!student) {
			if (action === 'sign-up') {
				return student;
			} else if (action === 'sign-in') {
				return student;
			} else {
				throw new BadRequestException({
					message: ERRORS_DICTIONARY.STUDENT_NOT_FOUND,
					details: 'Student not found!!',
				});
			}
		}

		return student;
	}
	async getProfile(username: string) {
		let result: any = {};
		let id: string = '';
		const normalizedUsername = username.toLowerCase();
		const student = await this.studentsRepository.findOne({ username: { $regex: `^${normalizedUsername}$`, $options: 'i' } });
		const citizen = await this.citizenRepository.findOneByCondition({
			username: { $regex: `^${normalizedUsername}$`, $options: 'i' },
		});
		if (!student && !citizen) {
			throw new BadRequestException({
				message: ERRORS_DICTIONARY.STUDENT_NOT_FOUND,
				details: 'Student not found!!',
			});
		}
		if (student) {
			result = student;
			id = student.id;
		}
		if (citizen) {
			result = citizen;
			id = citizen.id;
		}

		const quizResults = await this.quizResultService.findAll(
			`{"user_id":"${id}"}`,
		);

		return { ...result.toObject(), quizResults: quizResults.items };
	}
	async updateProfile(data: UpdateStudentDto, id: string) {
		let result: any = {};
		const [student, citizen] = await Promise.all([
			this.studentsRepository.findOneByCondition({ _id: id }),
			this.citizenRepository.findOneByCondition({ _id: id }),
		]);

		if (student) {
			if (id !== student._id.toString()) {
				throw new BadRequestException({
					message: ERRORS_DICTIONARY.STUDENT_NOT_FOUND,
					details: 'Không tìm thấy người dùng!!',
				});
			}

			return await this.studentsRepository.update(id, {
				...data,
				organizationId: data.organizationId
					? new mongoose.Types.ObjectId(data.organizationId)
					: undefined,
			});
		}
		if (citizen) {
			if (id !== citizen._id.toString()) {
				throw new BadRequestException({
					message: ERRORS_DICTIONARY.STUDENT_NOT_FOUND,
					details: 'Không tìm thấy người dùng!!',
				});
			}
			return await this.citizenRepository.update(id, {
				...data,
			});
		}
		throw new BadRequestException({
			message: ERRORS_DICTIONARY.STUDENT_NOT_FOUND,
			details: 'Student not found!!',
		});
	}

	async update(
		id: string,
		updateStudentDto: UpdateStudentDto,
	): Promise<Student> {
		if (updateStudentDto.organizationId) {
			if (!mongoose.Types.ObjectId.isValid(updateStudentDto.organizationId)) {
				throw new BadRequestException({
					message: 'Invalid organization ID format',
					details: 'Organization ID must be a valid ObjectId',
				});
			}
			updateStudentDto.organizationId = new mongoose.Types.ObjectId(
				updateStudentDto.organizationId,
			) as any;
		}
		const updatedUser = await this.studentsRepository.update(id, {
			...updateStudentDto,
			organizationId: updateStudentDto.organizationId
				? new mongoose.Types.ObjectId(updateStudentDto.organizationId)
				: undefined,
		});
		if (!updatedUser) {
			throw new BadRequestException({
				message: ERRORS_DICTIONARY.STUDENT_NOT_FOUND,
				details: 'Student not found!!',
			});
		}
		return updatedUser;
	}
	async changePassword(
		data: ChangePasswordDTO,
		id: string,
	): Promise<Student | Citizen> {
		const { password, old_password } = data;
		const [student, citizen] = await Promise.all([
			this.studentsRepository.findOneByCondition({ _id: id }),
			this.citizenRepository.findOneByCondition({ _id: id }),
		]);

		if (student) {
			// Check if the old password is correct
			const isOldPasswordCorrect = await bcrypt.compare(
				old_password,
				student.password,
			);
			if (!isOldPasswordCorrect) {
				throw new BadRequestException({
					message: ERRORS_DICTIONARY.STUDENT_PASSWORD_INCORRECT,
					details: 'Mật khẩu cũ không chính xác',
				});
			}

			if (id !== student._id.toString()) {
				throw new BadRequestException({
					message: ERRORS_DICTIONARY.STUDENT_NOT_FOUND,
					details: 'Không tìm thấy người dùng!!',
				});
			}

			// Check if the password is the same as the current password

			return this.studentsRepository.update(id, {
				password: await bcrypt.hash(password, this.SALT_ROUNDS),
			});
		}
		if (citizen) {
			const isOldPasswordCorrect = await bcrypt.compare(
				old_password,
				citizen.password,
			);
			if (!isOldPasswordCorrect) {
				throw new BadRequestException({
					message: ERRORS_DICTIONARY.STUDENT_PASSWORD_INCORRECT,
					details: 'Mật khẩu cũ không chính xác',
				});
			}

			if (id !== citizen._id.toString()) {
				throw new BadRequestException({
					message: ERRORS_DICTIONARY.STUDENT_NOT_FOUND,
					details: 'Không tìm thấy người dùng!!',
				});
			}

			return this.citizenRepository.update(id, {
				password: await bcrypt.hash(password, this.SALT_ROUNDS),
			});
		}
		throw new BadRequestException({
			message: ERRORS_DICTIONARY.STUDENT_NOT_FOUND,
			details: 'Không tìm thấy người dùng!!',
		});
	}
	async gerUser(id: string) {
		const [student, citizen] = await Promise.all([
			this.studentsRepository.findOneByCondition({ _id: id }),
			this.citizenRepository.findOneByCondition({ _id: id }),
		]);

		if (student) {
			const data = omit(student, ['password']);
			return { ...data.toObject(), role: 'Student' };
		}
		if (citizen) {
			const data = omit(citizen, ['password']);
			return { ...data.toObject(), role: 'Citizen' };
		}
		throw new BadRequestException({
			message: ERRORS_DICTIONARY.STUDENT_NOT_FOUND,
			details: 'Không tìm thấy người dùng!!',
		});
	}

	async remove(id: string): Promise<boolean> {
		console.log('userId', id);
		const [student, citizen] = await Promise.all([
			this.studentsRepository.findOneByCondition({ _id: id }),
			this.citizenRepository.findOneByCondition({ _id: id }),
		]);
		if (student) {
			return await this.studentsRepository.remove(id);
		}
		if (citizen) {

			return await this.citizenRepository.remove(id);
		}
		throw new BadRequestException({
			message: ERRORS_DICTIONARY.STUDENT_NOT_FOUND,
			details: 'Không tìm thấy người dùng!!',
		});
		// const result = await this.studentsRepository.remove(id);
		// if (!result) {
		// 	throw new NotFoundException(`Student with ID ${id} not found`);
		// }
	}

	async unActive(id: string): Promise<Student> {
		return await this.studentsRepository.update(id, {
			deleted_at: new Date(),
			isActive: false,
		});
	}

	async setIsActiveTrue(id: string): Promise<Student> {
		return await this.studentsRepository.update(id, {
			isActive: true,
		});
	}

	async findByOrgId(organizationId: string): Promise<Student[]> {
		return this.studentsRepository.findByOrgId(organizationId);
	}

	async countAllStudents() {
		return await this.studentsRepository.countAllStudents();
	}

	async countAllUsers() {
		try {
			const students = await this.studentsRepository.countAllStudents();
			const citizens = await this.citizenRepository.countAllCitizens();

			return {
				students: students,
				citizens: citizens,
			};
		} catch (error) {
			throw new BadRequestException({
				statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
				error: error.message,
				message:
					'Có lỗi xảy ra, vui lòng thử lại sau',
			});
		}
	}
}
