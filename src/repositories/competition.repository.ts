import { Organization } from '@modules/organizations/entities/organization.entity';
import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, Model, Types } from 'mongoose';
import { Competition } from '../modules/competitions/entities/competition.entity';
import { CompetitionsRepositoryInterface } from '@modules/competitions/interfaces/competition.interface';
import { Quiz } from '@modules/quiz/entities/quiz.entity';

@Injectable()
export class CompetitionsRepository implements CompetitionsRepositoryInterface {
	constructor(
		@InjectModel(Competition.name)
		private readonly competition_model: Model<Competition>,
		@InjectModel(Quiz.name)
		private readonly quizModel: Model<Quiz>,
	) { }
	async findOne(
		condition: FilterQuery<Competition>,
	): Promise<Competition | null> {
		return await this.competition_model.findOne(condition).populate('organizationId').exec();
	}

	async create(data: Partial<Competition>): Promise<Competition> {
		try {
			const newCompetition = new this.competition_model(data);
			const savedCompetition = await newCompetition.save();
			return savedCompetition;
		} catch (error) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message: `Đã có lỗi xảy ra ${error}`,
			});
		}
	}
	async findAll(
		filterRaw: string = '',
		searchPhase: string = '',
		page: number = 1,
		limit: number = 10,
		sortBy: string = 'createdAt',
		sortOrder: 'asc' | 'desc' = 'asc',
	): Promise<any> {
		try {
			let filter: any = {};

			if (filterRaw) {
				try {
					// Parse JSON string thành object
					filter = JSON.parse(filterRaw);
				} catch (err) {
					throw new BadRequestException('Invalid filter format');
				}
			}
			if (searchPhase) {
				if (filter.$or) {
					filter.$or.push(
						{ name: new RegExp(searchPhase, 'i') },
						{ description: new RegExp(searchPhase, 'i') },
					);
				} else {
					filter.$or = [
						{ name: new RegExp(searchPhase, 'i') },
						{ description: new RegExp(searchPhase, 'i') },
					];
				}
			}

			const validPage = Number(page) > 0 ? Number(page) : 1;
			const validLimit = Number(limit) > 0 ? Number(limit) : 10;
			const skip = (validPage - 1) * validLimit;
			const sortDirection = sortOrder === 'asc' ? 1 : -1;

			const users = await this.competition_model
				.find(filter)
				.skip(skip)
				.limit(limit)
				.populate('organizationId')
				.sort({ [sortBy]: sortDirection })
				.populate('organizationId')
				.exec();

			const totalItemCount = await this.competition_model
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
				message: `Đã có lỗi xảy ra ${error}`,
			});
		}
	}

	async update(
		id: string,
		data: Partial<Competition>,
	): Promise<Competition | null> {
		return await this.competition_model
			.findByIdAndUpdate(id, data, { new: true })
			.exec();
	}

	async findById(id: string) {
		return await this.competition_model.findById(id).populate('organizationId').exec();
	}

	async remove(id: string | Types.ObjectId): Promise<Competition | null> {
		const stringId = id instanceof Types.ObjectId ? id.toString() : id;
		return this.competition_model
			.findByIdAndUpdate(
				stringId,
				{ deleted_at: new Date(), isActive: false },
				{ new: true },
			)
			.exec();
	}

	async findBySlug(slug: string): Promise<Competition> {
		const competition = await this.competition_model.findOne({ slug });
		if (!competition) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message: 'Đã có lỗi xảy ra trong lúc tìm kiếm, vui lòng thử lại sau',
			});
		}
		return competition;
	}


	async findByOrgId(organizationId: string): Promise<Competition> {

		try {
			// Chuyển 'organizationId' từ string sang ObjectId
			const orgId = mongoose.Types.ObjectId.isValid(organizationId)
				? new mongoose.Types.ObjectId(organizationId)
				: null;

			if (!orgId) {
				throw new BadRequestException({
					status: HttpStatus.BAD_REQUEST,
					message: 'organizationId không hợp lệ',
				});
			}

			// Sử dụng toán tử $in để tìm kiếm trong mảng organizationId
			const competition = await this.competition_model.findOne({
				organizationId: { $in: [orgId] }, // Tìm kiếm trong mảng
			});
			console.log('Competition Found:', competition);
			if (!competition) {
				throw new BadRequestException({
					status: HttpStatus.BAD_REQUEST,
					message: 'Không tìm thấy cuộc thi với tổ chức này.',
				});
			}

			return competition;
		} catch (error) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message: 'Đã có lỗi xảy ra trong lúc tìm kiếm cuộc thi.',
				details: error.message,
			});
		}
	}

	async findOrganizationIdByQuizId(quizId: string): Promise<Competition> {
		try {
			// Validate quizId
			const isValid = mongoose.Types.ObjectId.isValid(quizId);
			if (!isValid) {
				throw new BadRequestException('quizId không hợp lệ');
			}

			// Lấy quiz theo ID và populate competitionId
			const quiz = await this.quizModel.findById(quizId).populate('competitionId');
			const competition = await this.competition_model.findById(quiz.competitionId);
			return competition;
		} catch (error) {
			throw new BadRequestException({
				message: 'Đã có lỗi xảy ra trong quá trình tìm organizationId',
				details: error.message,
			});
		}
	}


	async findByOrgIdAndAll(organizationId: string): Promise<Competition[]> {
		try {
			// Chuyển 'organizationId' từ string sang ObjectId
			const orgId = mongoose.Types.ObjectId.isValid(organizationId)
				? new mongoose.Types.ObjectId(organizationId)
				: null;

			if (!orgId) {
				throw new BadRequestException({
					status: HttpStatus.BAD_REQUEST,
					message: 'organizationId không hợp lệ',
				});
			}

			// Tìm cuộc thi có organizationId chứa orgId hoặc bằng null
			const competitions = await this.competition_model.find({
				$or: [
					{ organizationId: { $in: [orgId] } },
					{ organizationId: null }
				],
			});

			if (!competitions || competitions.length === 0) {
				throw new BadRequestException({
					status: HttpStatus.BAD_REQUEST,
					message: 'Không tìm thấy cuộc thi phù hợp.',
				});
			}

			return competitions;
		} catch (error) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message: 'Đã có lỗi xảy ra trong lúc tìm kiếm cuộc thi.',
				details: error.message,
			});
		}
	}


	async findAllWithNullOrganization(): Promise<Competition[]> {
		try {
			const competitions = await this.competition_model.find({
				$or: [
					{ organizationId: null },
					{ organizationId: { $exists: true, $size: 0 } } // mảng rỗng
				]
			});

			return competitions;
		} catch (error) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message: 'Đã có lỗi xảy ra khi tìm các cuộc thi không có tổ chức.',
				details: error.message,
			});
		}
	}


	async countCompetitionsByMonthRaw(): Promise<any[]> {
		const now = new Date();
		const lastYear = new Date(now.getFullYear() - 1, now.getMonth(), 1);

		return this.competition_model.aggregate([
			{
				$match: {
					startDate: { $gte: lastYear, $lte: now },
				},
			},
			{
				$group: {
					_id: {
						year: { $year: '$startDate' },
						month: { $month: '$startDate' },
					},
					count: { $sum: 1 },
				},
			},
			{
				$sort: {
					'_id.year': 1,
					'_id.month': 1,
				},
			},
		]);
	}



}
