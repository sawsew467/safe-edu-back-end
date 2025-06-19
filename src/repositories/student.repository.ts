import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, Model, Types } from 'mongoose';
import { Student } from '@modules/students/entities/student.entity';
import { StudentsRepositoryInterface } from '@modules/students/interfaces/students.interface';
import * as moment from 'moment';

@Injectable()
export class StudentsRepository implements StudentsRepositoryInterface {
	constructor(
		@InjectModel(Student.name) private readonly student_Model: Model<Student>,
	) { }
	async findOne(condition: FilterQuery<Student>): Promise<Student | null> {
		return await this.student_Model
			.findOne(condition)
			.populate([
				{ path: 'achievements' },
				{ path: 'registration_competition' },
			])
			.populate('organizationId')
			.exec();
	}

	async create(data: Partial<Student>): Promise<Student> {
		try {
			const newStudent = new this.student_Model(data);
			const savedStudent = await newStudent.save();
			return savedStudent;
		} catch (error) {
			console.error('Error saving new Student:', error.message);
			throw new BadRequestException(
				'Failed to create Student. Please try again.',
			);
		}
	}
	async findAll() {
		const Students = await this.student_Model
			.find()
			.populate([
				{ path: 'achievements' },
				{ path: 'registration_competition' },
			])
			.populate('organizationId')
			.exec();

		const total = await this.student_Model.countDocuments().exec();
		return { items: Students, total };
	}

	async getStudentWithRole(StudentId: string): Promise<Student | null> {
		return await this.student_Model.findById(StudentId)
			.populate('role')
			.populate('organizationId')
			.exec();
	}

	async update(id: string, data: Partial<Student>): Promise<Student | null> {
		return await this.student_Model
			.findByIdAndUpdate(id, data, { new: true })
			.exec();
	}

	async remove(id: string): Promise<boolean> {
		const result = await this.student_Model.findByIdAndDelete(id).exec();
		return !!result;
	}

	async findOneByCondition(
		condition: FilterQuery<Student>,
	): Promise<Student | null> {
		try {
			const student = await this.student_Model
				.findOne(condition)
				.populate('organizationId')
				.exec();
			return student;
		} catch (error) {
			throw error;
		}
	}

	async delete(id: string | Types.ObjectId): Promise<Student | null> {
		const stringId = id instanceof Types.ObjectId ? id.toString() : id;
		return this.student_Model
			.findByIdAndUpdate(
				stringId,
				{ deleted_at: new Date(), isActive: false },
				{ new: true },
			)
			.exec();
	}

	async findByOrgId(organizationId: string): Promise<Student[]> {
		console.log('OrganizationId:', organizationId);
		console.log('Is Valid ObjectId:', mongoose.Types.ObjectId.isValid(organizationId));

		try {
			const orgId = mongoose.Types.ObjectId.isValid(organizationId)
				? new mongoose.Types.ObjectId(organizationId)
				: null;

			if (!orgId) {
				throw new BadRequestException({
					status: HttpStatus.BAD_REQUEST,
					message: 'organizationId không hợp lệ',
				});
			}

			const students = await this.student_Model.find({
				organizationId: { $in: [orgId] }, // organizationId là mảng
				isActive: true,
				deleted_at: null,
			});

			return students;
		} catch (error) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message: 'Lỗi khi tìm học sinh theo tổ chức.',
				details: error.message,
			});
		}
	}
	async countAllStudents() {
			const total = await this.student_Model.countDocuments().exec();
	
			const startOfMonth = moment().startOf('month').toDate();
			const endOfMonth = moment().endOf('month').toDate();
	
			const monthlyRegistered = await this.student_Model.countDocuments({
				created_at: { $gte: startOfMonth, $lte: endOfMonth },
			});
	
			return {
				total,
				monthlyRegistered,
			};
	}
}
