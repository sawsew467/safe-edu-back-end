import {
	BadRequestException,
	Inject,
	Injectable,
	NotFoundException,
	HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { FindAllResponse, QueryParams } from 'src/types/common.type';
import { FilterQuery } from 'mongoose';
import { log } from 'console';
import { Admin } from './entities/admin.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminRepositoryInterface } from './interfaces/admin.interface';
import { ERRORS_DICTIONARY } from 'src/constraints/error-dictionary.constraint';
import * as XLSX from 'xlsx';

@Injectable()
export class AdminService {
	constructor(
		@Inject('AdminRepositoryInterface')
		private readonly adminRepository: AdminRepositoryInterface,
		// private readonly configService: ConfigService,
	) { }

	async setCurrentRefreshToken(
		adminId: string,
		refreshToken: string,
	): Promise<void> {
		try {
			// Tìm người dùng theo ID
			const admin = await this.adminRepository.findById(adminId);

			if (!admin) {
				throw new Error('admin not found');
			}

			// Cập nhật refresh token cho người dùng
			admin.refreshToken = refreshToken;
		} catch (error) {
			throw new Error(`Failed to set refresh token for user ${adminId}: ${error.message}`);
		}
	}
	// Method to find a user by condition
	async findOneByCondition(
		condition: FilterQuery<Admin>,
	): Promise<Admin | null> {
		const result = await this.adminRepository.findOne(condition);
		if (!result) {
			throw new NotFoundException(`Admin with ID ${condition} not found`);
		}
		return result;
	}


	async findOneById(
		adminId: string,
	): Promise<Admin | null> {

		const admin = await this.adminRepository.findById(adminId);
		if (!admin) {
			throw new NotFoundException(`Admin with ID ${adminId} not found`);
		}
		return admin;
	}
	//

	async create(createDto: CreateAdminDto): Promise<Admin> {
		const {email, phone_number} = createDto;
		const exsited_email = await this.adminRepository.findOne({ email });
		const existed_phone_number = await this.adminRepository.findOne({ phone_number })
		if(existed_phone_number) {
			throw new BadRequestException({
				message: ERRORS_DICTIONARY.ADMIN_PHONE_NUMBER_IS_EXIST,
				details: 'Phone number already exist',
			});
		}

		if(exsited_email) {
			throw new BadRequestException({
				message: ERRORS_DICTIONARY.ADMIN_EMAIL_IS_EXIST,
				details: 'Email already exist',
			});
		}

		const admin = await this.adminRepository.create({
			...createDto,
		});

		return admin;
	}

	async findAll() {
		return await this.adminRepository.findAll();
	}

	async update(id: string, updateUserDto: UpdateAdminDto): Promise<Admin> {
		const updatedAdmin = await this.adminRepository.update(id, {
			...updateUserDto,
		});
		if (!updatedAdmin) {
			throw new NotFoundException(`Admin with ID ${id} not found`);
		}
		return updatedAdmin;
	}

	async getAdminByEmail(email: string): Promise<Admin> {
		const admin = await this.adminRepository.findOne({ email });

		if (!admin) {
			throw new NotFoundException(`admin with email ${email} not found`);
		}

		return admin;
	}

	async delete(id: string): Promise<Admin> {
		await this.adminRepository.update(id, {
			deleted_at: new Date(),
			isActive: false,
		});
	
		// Truy vấn lại để lấy bản ghi đã cập nhật
		const admin = await this.adminRepository.findOne({ id });
		
	
		return admin;
	}
	

	async setActiveIsTrue(id: string): Promise<Admin> {
		// Cập nhật trường isActive thành true
		const admin = await this.adminRepository.update(id,
			{ isActive: true },
		);
		return admin;
	}

	async importFromExcel(file: Express.Multer.File) {
		try {
			const workbook = XLSX.read(file.buffer, { type: 'buffer' });
			const sheetName = workbook.SheetNames[0];
			const worksheet = workbook.Sheets[sheetName];
			const data: any[] = XLSX.utils.sheet_to_json(worksheet);

			const successAccounts = [];
			const failedAccounts = [];

			for (const row of data) {
				try {
					const first_name = row['Họ'] || row['first_name'];
					const last_name = row['Tên'] || row['last_name'];
					const email = row['Email'] || row['email'];
					let phone_number = row['Số điện thoại'] || row['phone_number'];

					if (!first_name || !last_name || !email || !phone_number) {
						failedAccounts.push({
							row: row,
							reason: 'Thiếu thông tin bắt buộc (Họ, Tên, Email, Số điện thoại)',
						});
						continue;
					}

					// Format phone number
					phone_number = this.formatPhoneNumber(phone_number);

					// Validate phone number format
					if (!phone_number || !/^\+84\d{9}$/.test(phone_number)) {
						failedAccounts.push({
							row: row,
							reason: 'Số điện thoại không hợp lệ (phải là số Việt Nam 10 chữ số)',
						});
						continue;
					}

					// Check if email already exists
					const existedEmail = await this.adminRepository.findOne({ email });

					if (existedEmail) {
						failedAccounts.push({
							email: email,
							reason: 'Email đã tồn tại',
						});
						continue;
					}

					// Check if phone number already exists
					const existedPhone = await this.adminRepository.findOne({
						phone_number,
					});

					if (existedPhone) {
						failedAccounts.push({
							email: email,
							phone_number: phone_number,
							reason: 'Số điện thoại đã tồn tại',
						});
						continue;
					}

					const adminData: any = {
						first_name,
						last_name,
						email,
						phone_number,
					};

					const admin = await this.adminRepository.create(adminData);

					successAccounts.push({
						email: admin.email,
						first_name: admin.first_name,
						last_name: admin.last_name,
						phone_number: admin.phone_number,
					});
				} catch (error) {
					failedAccounts.push({
						row: row,
						reason: error.message,
					});
				}
			}

			return {
				statusCode: HttpStatus.CREATED,
				message: `Import thành công ${successAccounts.length} tài khoản admin, thất bại ${failedAccounts.length} tài khoản`,
				data: {
					successAccounts,
					failedAccounts,
					total: data.length,
					success: successAccounts.length,
					failed: failedAccounts.length,
				},
			};
		} catch (error) {
			throw new BadRequestException({
				statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
				error: error.message,
				message: 'Có lỗi xảy ra khi import file Excel',
			});
		}
	}

	private formatPhoneNumber(phone: string): string {
		if (!phone) return phone;
		phone = phone.toString().trim().replace(/[\s\-\(\)]/g, '');

		if (phone.startsWith('+84')) {
			return phone;
		}

		if (phone.startsWith('84')) {
			return '+' + phone;
		}

		if (phone.startsWith('0')) {
			return '+84' + phone.slice(1);
		}

		return '+84' + phone;
	}
}
