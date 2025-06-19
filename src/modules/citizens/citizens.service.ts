import {
	HttpStatus,
	Inject,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { CreateCitizenDto } from './dto/create-citizen.dto';
import { UpdateCitizenDto } from './dto/update-citizen.dto';
import { OrganizationsService } from '@modules/organizations/organizations.service';
import mongoose, { FilterQuery, Model } from 'mongoose';
import { Citizen } from './entities/citizen.entity';
import { CitizensRepositoryInterface } from './interfaces/citizens.interfaces';
import { ERRORS_DICTIONARY } from 'src/constraints/error-dictionary.constraint';
import { StudentsRepositoryInterface } from '@modules/students/interfaces/students.interface';
import * as bcrypt from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';
import { Province } from '@modules/provinces/entities/province.entity';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class CitizensService {
	private readonly SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10;
	constructor(
		@Inject('CitizensRepositoryInterface')
		private readonly citizensRepository: CitizensRepositoryInterface,
		private readonly organizationService: OrganizationsService,
		@Inject('StudentsRepositoryInterface')
		private readonly studentsRepository: StudentsRepositoryInterface,
		@InjectModel(Province.name)
		private readonly provinceModel: Model<Province>
	) { }

	async setCurrentRefreshToken(
		_id: string,
		refreshToken: string,
	): Promise<void> {
		try {
			const Citizen = await this.citizensRepository.findOneByCondition({ _id });
			if (!Citizen) {
				throw new Error('User not found');
			}
			Citizen.current_refresh_token = refreshToken;
			await this.citizensRepository.update(_id, {
				current_refresh_token: refreshToken,
			});
		} catch (error) {
			console.error(`Failed to set refresh token for user ${_id}:`, error);
			throw new Error('Failed to set refresh token');
		}
	}
	async create(createDto: CreateCitizenDto): Promise<Citizen> {
		try {
			const {
				first_name,
				last_name,
				phone_number,
				province,
				username,
				password,
				email,
				date_of_birth,
			} = createDto;


			const normalizedUsername = username.toLowerCase();
			const [existed_phone_number_student, existed_phone_number_student_citizen] =
				await Promise.all([
					await this.studentsRepository.findOneByCondition({ phone_number }),
					await this.citizensRepository.findOneByCondition({ phone_number }),
				]);
			const [existed_student_username, existed_citizen_username] =
				await Promise.all([
					await this.studentsRepository.findOneByCondition({ normalizedUsername }),
					await this.citizensRepository.findOneByCondition({ normalizedUsername }),
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
					message: ERRORS_DICTIONARY.CITIZEN_PHONE_NUMBER_EXISTS,
					details: 'Phone number already exist',
				});
			}

			const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

			if (province) {
				const citizen = await this.citizensRepository.create({
					first_name,
					last_name,
					phone_number,
					province: new mongoose.Types.ObjectId(province),
					username: normalizedUsername,
					password: hashedPassword,
					email,
					date_of_birth,
				});
				return citizen;
			}
			else {
				const citizen = await this.citizensRepository.create({
					first_name,
					last_name,
					phone_number,
					username: normalizedUsername,
					password: hashedPassword,
					email,
					date_of_birth,
				});
				return citizen;
			}




			
		} catch (error) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message: "Đã có lỗi xảy ra, vui lòng thử lại sau",
				details: `Đã có lỗi xảy ra: ${error.message}`
			})
		}
	}

	async findAll(
		searchPhase?: string,
		page?: number,
		limit?: number,
		sortBy?: string,
		sortOrder?: 'asc' | 'desc',
	): Promise<any> {
		return await this.citizensRepository.findAll(
			searchPhase,
			Number(page),
			Number(limit),
			sortBy,
			sortOrder,
		);
	}

	async findOne(_id: string) {
		return await this.citizensRepository.findOneByCondition({ _id });
	}
	async findOneByCondition(
		condition: FilterQuery<Citizen>,
		action: string,
	): Promise<Citizen | null> {
		const citizen = await this.citizensRepository.findOneByCondition(condition);
		if (!citizen) {
			if (action === 'sign-up' || action === 'sign-in') {
				return citizen;
			} else {
				throw new BadRequestException({
					message: ERRORS_DICTIONARY.CITIZEN_NOT_FOUND,
					details: 'citizen not found!!',
				});
			}
		}
		return citizen;
	}

	async update(
		id: string,
		updateCitizenDto: UpdateCitizenDto,
	): Promise<Citizen> {
		const updatedUser = await this.citizensRepository.update(id, {
			...updateCitizenDto,
			province: new mongoose.Types.ObjectId(updateCitizenDto.province),
		});
		if (!updatedUser) {
			throw new BadRequestException({
				message: ERRORS_DICTIONARY.CITIZEN_NOT_FOUND,
				details: 'citizen not found!!',
			});
		}
		return updatedUser;
	}

	async remove(id: string): Promise<void> {
		const result = await this.citizensRepository.remove(id);
		if (!result) {
			throw new NotFoundException(`Citizen with ID ${id} not found`);
		}
	}

	async delete(id: string): Promise<Citizen> {
		return await this.citizensRepository.update(id, {
			deleted_at: new Date(),
			isActive: false,
		});
	}

	async setIsActiveTrue(id: string): Promise<Citizen> {
		return await this.citizensRepository.update(id, {
			isActive: true,
		});
	}

	async countAllCitizens() {
		return await this.citizensRepository.countAllCitizens();
	}
}
