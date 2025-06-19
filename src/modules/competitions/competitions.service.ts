import {
	BadRequestException,
	HttpStatus,
	Inject,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { UpdateCompetitionDto } from './dto/update-competition.dto';
import { CompetitionsRepository } from '@repositories/competition.repository';
import mongoose, { Types } from 'mongoose';
import { Competition } from './entities/competition.entity';
import { ERRORS_DICTIONARY } from 'src/constraints/error-dictionary.constraint';
import { QuizResultService } from '@modules/quiz-result/quiz-result.service';
import { Quiz, QuizType } from '@modules/quiz/entities/quiz.entity';
import { QuizService } from '@modules/quiz/quiz.service';
import { QuizResult } from '@modules/quiz-result/entities/quiz-result.entity';
import { StudentsService } from '@modules/students/students.service';
import { CitizensService } from '@modules/citizens/citizens.service';
import { OrganizationsService } from '@modules/organizations/organizations.service';

@Injectable()
export class CompetitionsService {
	repository: any;
	constructor(
		@Inject('CompetitionsRepositoryInterface')
		private readonly competition_repository: CompetitionsRepository,
		private readonly quizResultService: QuizResultService,
		private readonly quizService: QuizService,
		private readonly student_service: StudentsService,
		private readonly citizen_service: CitizensService,
		private readonly organizationService: OrganizationsService,
	) { }

	async create(createCompetitionDto: CreateCompetitionDto, organizationId?: string): Promise<Competition> {
		try {
			const { title, description, image_url ,startDate, endDate, slug } = createCompetitionDto;

			const existed_competition = await this.competition_repository.findOne({ slug });
			if (existed_competition) {
				throw new BadRequestException({
					message: ERRORS_DICTIONARY.COMPETITION_IS_EXIST,
					details: 'Slug already exists',
				});
			}

			if (organizationId) {
				const orgId = new mongoose.Types.ObjectId(organizationId);
				const existed_organization = await this.organizationService.findOneById(organizationId);
				if (!existed_organization) {
					throw new BadRequestException({
						message: 'Invalid organizationId',
						details: 'Organization does not exist',
					});
				}
			}

			if (new Date(endDate).getTime() < new Date(startDate).getTime()) {
				throw new BadRequestException({
					message: ERRORS_DICTIONARY.INVALID_END_DATE,
					details: 'Ngày bắt đầu phải bé hơn ngày kết thúc',
				});
			}
			console.log('organizationId', organizationId);
			const competition = await this.competition_repository.create({
				title,
				description,
				image_url,
				startDate,
				endDate,
				slug,
				organizationId: organizationId ? new mongoose.Types.ObjectId(organizationId) : undefined, 
			});

			return this.competition_repository.findOne(competition);
		} catch (error) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message: 'Đã có lỗi xảy ra khi tạo cuộc thi, vui lòng thử lại sau',
				details: `Có lỗi xảy ra khi tạo cuộc thi: ${error.message}`,
			});
		}
	}


	async findAll(
		user: any,
		filter?: string,
		searchPhase?: string,
		page?: number,
		limit?: number,
		sortBy?: string,
		sortOrder?: 'asc' | 'desc',
	) {
		if (!user) {
			const competitions = await this.competition_repository.findAll(
				filter,
				searchPhase,
				Number(page),
				Number(limit),
				sortBy,
				sortOrder,
			);

			const data = await Promise.all(
				competitions?.items?.map(async (competition) => {
					const { id } = competition;
					const { data: quizs } =
						await this.quizService.getAllByCompetitionId(id);
					const quiz_results = await Promise.all(
						quizs?.map(async (quiz: Quiz) => {
							return await this.quizResultService.findOneByQuizId(
								quiz._id.toString(),
							);
						}) || [],
					).then((data) => data?.flat());
					return {
						...competition.toObject(),
						number_join: quiz_results?.length || 0,
					};
				}),
			);
			return data;
		} else {
			const competitions = await this.competition_repository.findAll(
				filter,
				searchPhase,
				Number(page),
				Number(limit),
				sortBy,
				sortOrder,
			);

			const data = await Promise.all(
				competitions?.items?.map(async (competition) => {

					const { id } = competition;
					const { data: quizs } =
						await this.quizService.getAllByCompetitionId(id);
					const quiz_results = await Promise.all(
						quizs.map(async (quiz: Quiz) => {
							console.log("user", user.userId)
							const quiz_result = await this.quizResultService.findOneByQuizIdAndUserId(
							quiz._id.toString(),
							user.userId,
							);

							return quiz_result;
						}) || [],
					)
					console.log('quiz_results', quiz_results);
					console.log('quizs', quizs);

				const number_done = quiz_results.reduce((number, item) => item ? number + 1 : number, 0);
				console.log('number_done', number_done);

					console.log("competition", competition?.title);


					const status = quizs?.length === 0 
					? 'not-started' :
						number_done === quizs?.length
							? 'done'
							: number_done !== 0
								? 'doing'
								: 'not-started';
					return {
						...competition.toObject(),
						status,
					};
				}),
			);
			return data;
		}
	}

	async findById(id: string) {
		return await this.competition_repository.findById(id);
	}

	async update(
		id: string,
		updateCompetitionDto: UpdateCompetitionDto,
		organizationId?: string,
	): Promise<Competition> {
		try {
			const updatedCompetition = await this.competition_repository.update(id, {
				...updateCompetitionDto,
				organizationId: organizationId
					? new mongoose.Types.ObjectId(organizationId)
					: undefined,
			});

			if (!updatedCompetition) {
				throw new NotFoundException(`Competition with ID ${id} not found`);
			}

			return this.competition_repository.findOne(updatedCompetition);
		} catch (error) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message: 'Đã có lỗi xảy ra trong lúc cập nhật, vui lòng thử lại sau',
				details: `Đã có lỗi xảy ra: ${error.message}`,
			});
		}
	}


	async remove(id: string | Types.ObjectId): Promise<Competition | null> {
		try {
			return await this.competition_repository.remove(id);
		} catch (error) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message:
					'Đã có lỗi xảy ra trong lúc xóa cuộc thi, vui lòng thử lại sau',
				details: `Đã có lỗi xảy ra: ${error.message}`,
			});
		}
	}

	async findBySlug(slug: string): Promise<Competition> {
		try {
			const competition = await this.competition_repository.findBySlug(slug);
			return competition;
		} catch (error) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message:
					'Đã có lỗi xảy ra trong lúc tìm kiếm mã định danh, vui lòng thử lại sau',
				details: `Đã có lỗi xảy ra: ${error.message}`,
			});
		}
	}

	async findByOrgId(organizationId: string): Promise<Competition> {

		try {
			const competition = await this.competition_repository.findByOrgId(organizationId);
			return competition;
		} catch (error) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message:
					'Đã có lỗi xảy ra trong lúc tìm kiếm theo tổ chức, vui lòng thử lại sau',
				details: `Đã có lỗi xảy ra: ${error.message}`,
			});
		}
	}

	async findByOrgIdAndAll(user_id: string): Promise<Competition[]> {
	
		const [student, citizen] = await Promise.all([
				this.student_service.findOne(user_id),
				this.citizen_service.findOne(user_id),
			]);
		if (student) {
			const id = student?.organizationId._id;
			const competition = await this.competition_repository.findByOrgIdAndAll(id?.toString());
			return competition;
		}
		else if (citizen) {
		
			const competition = await this.competition_repository.findAllWithNullOrganization();
			return competition;
		}
		else {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message: 'Không tìm thấy tổ chức nào',
				details: 'Không tìm thấy tổ chức nào',
			});
		}
		
	}

	async countMonthly(): Promise<any[]> {
		const raw = await this.competition_repository.countCompetitionsByMonthRaw();
		const now = new Date();
		const months: { year: number; month: number; count: number }[] = [];

		for (let i = 12; i >= 0; i--) {
			const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
			months.push({
				year: date.getFullYear(),
				month: date.getMonth() + 1,
				count: 0,
			});
		}

		// Merge dữ liệu raw vào months
		for (const m of months) {
			const match = raw.find(r => r._id.year === m.year && r._id.month === m.month);
			if (match) {
				m.count = match.count;
			}
		}

		return months;
	}


	async active(id: string): Promise<Competition> {
		try {
			const competition = await this.competition_repository.update(id, {
				isActive: true,
			});
			if (!competition) {
				throw new BadRequestException({
					status: HttpStatus.BAD_REQUEST,
					message: 'Không tìm thấy cuộc thi để kích hoạt',
					details: 'Không tìm thấy cuộc thi để kích hoạt',
				});
			}
			return competition;
		} catch (error) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message: 'Đã có lỗi xảy ra trong lúc kích hoạt, vui lòng thử lại sau',
				details: `Đã có lỗi xảy ra: ${error.message}`,
			});
		}
	}
	async findleaderBoadBySlug(slug: string) {
		try {
			const competition = await this.competition_repository.findBySlug(slug);
			const { data: quizs } = await this.quizService.getAllByCompetitionId(
				competition._id.toString(),
			);
			const quiz_results = await Promise.all(
				quizs?.map(async (quiz: Quiz) => {
					const quiz_result = await this.quizResultService.findOneByQuizId(
						quiz._id.toString(),
					);
					return quiz_result;
				}) || [],
			)
				.then((data) => data?.flat())
				.then((data) => data?.filter((item) => item?.score !== undefined));

			const leaderBoard = {};

			quiz_results?.forEach((quiz_result: QuizResult) => {
				const { score, completedAt, startAt, quiz_id } = quiz_result;
				const { type } = quiz_id as any;
				const user_id = quiz_result.user_id.toString();
				if (!leaderBoard[user_id]) {
					leaderBoard[user_id] = {
						user_id,
						score: score || 0,
						time:
							type === QuizType.PaintingPropaganda
								? (startAt ?? new Date()).getTime() - new Date().getTime()
								: (completedAt ?? new Date()).getTime() -
								(startAt ?? new Date()).getTime(),
					};
				} else
					leaderBoard[user_id].score = leaderBoard[user_id].score + score || 0;
				leaderBoard[user_id].time +=
					type === QuizType.PaintingPropaganda
						? (startAt ?? new Date()).getTime() - new Date().getTime()
						: (completedAt ?? new Date()).getTime() -
						(startAt ?? new Date()).getTime();
			});

			const leader_board_array = Object.values(leaderBoard).sort(
				(
					a: { score: number; time: number },
					b: { score: number; time: number },
				) =>
					b?.score - a?.score !== 0 ? b?.score - a?.score : a?.time - b?.time,
			);

			const leader_board_info = await Promise.all(
				leader_board_array.map(
					async (item: { user_id: string; score: number; time: number }) => {
						const { user_id, score, time } = item;

						const [existed_student_user, existed_citizen_user] =
							await Promise.all([
								await this.student_service.findOneByCondition(
									{ _id: user_id },
									'sign-in',
								),
								await this.citizen_service.findOneByCondition(
									{ _id: user_id },
									'sign-in',
								),
							]);

						if (existed_student_user) {
							return {
								user: existed_student_user,
								score,
								time,
							};
						}
						if (existed_citizen_user) {
							return {
								user: existed_citizen_user,
								score,
								time,
							};
						}
						new Error(
							'Không tìm thấy người dùng trong danh sách sinh viên hoặc công dân',
						);
					},
				),
			);

			return leader_board_info;
		} catch (error) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message:
					'Đã có lỗi xảy ra trong lúc tìm kiếm mã định danh, vui lòng thử lại sau',
				details: `Đã có lỗi xảy ra: ${error.message}`,
			});
		}
	}
	async getAllBySlug(slug: string) {
		try {
			const competition = await this.competition_repository.findBySlug(slug);
			const quiz = await this.quizService.getAllByCompetitionId(
				competition._id.toString(),
			);

			return {
				...quiz,
			};
		} catch (error) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message: 'Đã có lỗi xảy ra khi lấy câu hỏi theo cuộc thi',
				details: `Lỗi: ${error.message}`,
			});
		}
	}
}
