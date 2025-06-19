import { GradePictureDto } from './dto/grade-picture.dto';
import {
	BadRequestException,
	ConflictException,
	HttpStatus,
	Injectable,
} from '@nestjs/common';
import { CreatePictureDto } from './dto/create-picture.dto';
import { UpdatePictureDto } from './dto/update-picture.dto';
import { Picture } from './entities/picture.entity';
import { read } from 'fs';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { QuizService } from '@modules/quiz/quiz.service';
import { QuizType } from '@modules/quiz/entities/quiz.entity';
import { QuizResult } from '@modules/quiz-result/entities/quiz-result.entity';
import { StudentsService } from '@modules/students/students.service';
import { CitizensService } from '@modules/citizens/citizens.service';
import { Competition } from '@modules/competitions/entities/competition.entity';

export class PictureService {
	constructor(
		@InjectModel(Picture.name)
		private readonly pictureModel: Model<Picture>,
		private readonly quizService: QuizService,
		@InjectModel(QuizResult.name)
		private readonly quizResultModel: Model<QuizResult>,
		private readonly studentService: StudentsService,
		private readonly citizenService: CitizensService,
	) {}

	async create(createPictureDto: CreatePictureDto, user_id: string) {
		try {
			const quiz = await this.quizService.findOneById(createPictureDto.quiz_id);
			if (!quiz || quiz.type !== QuizType.PaintingPropaganda)
				throw new BadRequestException({
					status: HttpStatus.BAD_REQUEST,
					message:
						'Không thể nộp tranh trên phần thi không có thể loại là vẽ tranh cỗ động',
				});

			const competition: Competition = (
				quiz?.competitionId as unknown as Competition[]
			)?.at(0);

			if (competition?.isActive === false) {
				throw new ConflictException({
					status: HttpStatus.CONFLICT,
					message: 'Cuộc thi đã kết thúc',
					details: 'Cuộc thi đã kết thúc',
				});
			}
			if (new Date(competition?.startDate).getTime() > new Date().getTime()) {
				throw new ConflictException({
					status: HttpStatus.CONFLICT,
					message: 'Cuộc thi chưa bắt đầu',
					details: 'Cuộc thi chưa bắt đầu',
				});
			}

			if (new Date(competition?.endDate).getTime() < new Date().getTime()) {
				throw new ConflictException({
					status: HttpStatus.CONFLICT,
					message: 'Cuộc thi đã kết thúc',
					details: 'Cuộc thi đã kết thúc',
				});
			}

			const picture = await this.pictureModel.create({
				...createPictureDto,
				user_id,
				slug: this.nameToSlug(createPictureDto.name),
			});
			await this.quizResultModel.create({
				quiz_id: createPictureDto.quiz_id,
				user_id,
				startAt: new Date(),
			});
			return picture;
		} catch (err) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message: err.message,
			});
		}
	}

	async findAll(
		filterRaw: string,
		searchPhase: string,
		page: number = 1,
		limit: number = 10,
		sortBy: string,
		sortOrder: 'asc' | 'desc',
	) {
		try {
			let filter: any = {};
			if (filterRaw) {
				filter = JSON.parse(filterRaw);
			}
			if (searchPhase) {
				if (filter.$or)
					filter.$or.push(
						{ name: new RegExp(searchPhase, 'i') },
						{ description: new RegExp(searchPhase, 'i') },
					);
				else
					filter.$or = [
						{ name: new RegExp(searchPhase, 'i') },
						{ description: new RegExp(searchPhase, 'i') },
					];
			}

			const validPage = Number(page) > 0 ? Number(page) : 1;
			const validLimit = Number(limit) > 0 ? Number(limit) : 10;
			const skip = (validPage - 1) * validLimit;
			const sortDirection = sortOrder === 'asc' ? 1 : -1;

			const users = await this.pictureModel
				.find(filter)
				.skip(skip)
				.limit(limit)
				.sort({ [sortBy]: sortDirection })
				.populate('quiz_id')
				.exec();

			const totalItemCount = await this.pictureModel
				.countDocuments(filter)
				.exec();
			const totalPages =
				totalItemCount > 0 ? Math.ceil(totalItemCount / validLimit) : 1;
			const itemFrom = totalItemCount === 0 ? 0 : skip + 1;
			const itemTo = Math.min(skip + validLimit, totalItemCount);

			const response = {
				items: users,
				totalItemCount: totalItemCount,
				totalPages: totalPages,
				itemFrom: itemFrom,
				itemTo: itemTo,
			};

			return response;
		} catch (error) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message:
					'Đã có lỗi xảy ra trong quá trình xem tranh vẽ, vui lòng thử lại sau',
				details: `Đã có lỗi xảy ra: ${error.message}`,
			});
		}
	}

	async findAllByQuizId(quiz_id: string) {
		try {
			const picture = await this.pictureModel
				.find({ quiz_id, isActive: true })
				.populate('quiz_id')
				.exec();

			const pictures_result = await Promise.all(
				picture.map(async (item) => {
					const quiz_reuslt = await this.quizResultModel.findOne({
						quiz_id: item.quiz_id,
						user_id: item.user_id,
					});
					return {
						...item.toObject(),
						score: quiz_reuslt?.score,
						feedback: quiz_reuslt?.feedback,
						quiz_result_id: quiz_reuslt?._id,
					};
				}),
			);
			return pictures_result;
		} catch {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message:
					'Đã có lỗi xảy ra trong quá trình xem tranh vẽ, vui lòng thử lại sau',
			});
		}
	}

	async findOneByPictureId(id: string) {
		try {
			const picture = await this.pictureModel
				.findOne({ _id: id, isActive: true })
				.populate('quiz_id')
				.exec();
			const [student, citizen] = await Promise.all([
				this.studentService.findOneByCondition(
					{ _id: picture.user_id },
					'sign-up',
				),
				this.citizenService.findOneByCondition(
					{ _id: picture.user_id },
					'sign-up',
				),
			]);

			const quiz_result = await this.quizResultModel.findOne({
				quiz_id: picture.quiz_id,
				user_id: picture.user_id,
			});

			if (student)
				return {
					...picture.toObject(),
					user_id: student,
					score: quiz_result?.score,
					feedback: quiz_result?.feedback,
					startAt: quiz_result?.startAt,
					completedAt: quiz_result?.completedAt,
				};

			if (citizen)
				return {
					...picture.toObject(),
					user_id: citizen,
					score: quiz_result?.score,
					feedback: quiz_result?.feedback,
					startAt: quiz_result?.startAt,
					completedAt: quiz_result?.completedAt,
				};

			new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message:
					'Không tìm thấy người dùng nào với id này, vui lòng thử lại sau',
			});
		} catch {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message:
					'Đã có lỗi xảy ra trong quá trình xem tranh vẽ, vui lòng thử lại sau',
			});
		}
	}

	async findMyPicture(quiz_id: string, user_id: string) {
		try {
			const picture = await this.pictureModel
				.findOne({
					quiz_id,
					user_id,
					isActive: true,
				})
				.populate('quiz_id')
				.exec();

			return this.findOneByPictureId(picture._id.toString());
		} catch {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message:
					'Đã có lỗi xảy ra trong quá trình xem tranh vẽ, vui lòng thử lại sau',
			});
		}
	}

	remove(id: string) {
		try {
			return this.pictureModel.findByIdAndUpdate(id, {
				isActive: false,
			});
		} catch {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message:
					'Đã có lỗi xảy ra trong quá trình xóa tranh vẽ, vui lòng thử lại sau',
			});
		}
	}

	nameToSlug = (name: string) => {
		return name
			.normalize('NFD') // Tách dấu ra khỏi ký tự gốc
			.replace(/[\u0300-\u036f]/g, '') // Xóa các dấu (dấu sắc, huyền, hỏi, ngã, nặng...)
			.replace(/đ/g, 'd') // Xử lý riêng chữ "đ"
			.replace(/Đ/g, 'D')
			.toLowerCase()
			.replace(/ /g, '-') // Đổi space thành gạch ngang
			.replace(/[^\w-]+/g, '') // Xóa ký tự đặc biệt
			.replace(/--+/g, '-') // Rút gọn dấu gạch ngang
			.replace(/^-+|-+$/g, ''); // Xóa dấu - ở đầu/cuối
	};
}
