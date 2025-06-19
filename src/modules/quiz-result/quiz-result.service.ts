import { Competition } from '@modules/competitions/entities/competition.entity';
import { Quiz } from '@modules/quiz/entities/quiz.entity';
import { BadRequestException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Submission } from '@modules/submission/entities/submission.entity';
import { QuizResult } from './entities/quiz-result.entity';
import { QuestionsService } from '@modules/questions/questions.service';
import { CompetitionsService } from '@modules/competitions/competitions.service';
import { PictureService } from '@modules/picture/picture.service';
import { GradePictureDto } from '@modules/picture/dto/grade-picture.dto';
import { OrganizationsRepositoryInterface } from '@modules/organizations/interfaces/organizations.interface';
import { QuizResultRepositoryInterface } from './interfaces/quiz-result.interface';
import { CompetitionsRepository } from '@repositories/competition.repository';
import { StudentsRepository } from '@repositories/student.repository';
import { CompetitionsRepositoryInterface } from '@modules/competitions/interfaces/competition.interface';
import { StudentsRepositoryInterface } from '@modules/students/interfaces/students.interface';

@Injectable()
export class QuizResultService {
	constructor(
		@Inject('QuizResultRepositoryInterface')
		private readonly quizResult_repository: QuizResultRepositoryInterface,
		@InjectModel(Submission.name)
		private readonly answerModel: Model<Submission>,
		private readonly questionsService: QuestionsService,
		@Inject('CompetitionsRepositoryInterface')
		private readonly competion_repository: CompetitionsRepositoryInterface,
		@Inject('StudentsRepositoryInterface')
		private readonly student_repository: StudentsRepositoryInterface,
	) { }

	async findAll(
		filter: string = '',
		searchPhase: string = '',
		pageNumber: number = 1,
		pageSize: number = 10,
		sortBy: string = 'createdAt',
		sortOrder: 'asc' | 'desc' = 'asc',
	) {
		return this.quizResult_repository.findAll(
			filter,
			searchPhase,
			pageNumber,
			pageSize,
			sortBy,
			sortOrder,
		);
	}

	async findOneByQuizId(quiz_id: string): Promise<any> {
		return this.quizResult_repository.findOneByQuizId(quiz_id);
	}

	async isDoQuiz(
		quizId: string,
		userId: string,
	): Promise<{ status: string }> {
		try {
			const submission = await this.quizResult_repository.findOneByQuizIdAndUserId(
				quizId,
				userId,

			);
			console.log('submission:', submission);
			const student = await this.student_repository.findOne({ _id: userId });
			const Competition = await this.competion_repository.findOrganizationIdByQuizId(quizId)

			if (submission && submission.startAt) {
				return { status: 'done' };
			} else {
				if (
					(Competition && Competition.isPublic === 'public') ||
					(student &&
						student.organizationId &&
						student.organizationId._id.toString() === Competition.organizationId.toString())
				) {
					return { status: 'not-started' };
				}
				else {

					return { status: 'cant-started' };


				}
			}
		} catch (error) {
			throw new BadRequestException({
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				error: 'Server error',
			});
		}
	}


	// 📌 Lấy một kết quả quiz theo ID
	async findOne(id: string): Promise<QuizResult> {
		const result = await this.quizResult_repository.findById(id).exec();
		if (!result) {
			throw new NotFoundException(`QuizResult with ID ${id} not found`);
		}
		return result;
	}

	async calculateQuizResult(
		quiz_id: string,
		user_id: string,
	) {

		const quizResult = await this.quizResult_repository
			.findOne({ quiz_id, user_id })
		const submission = await this.quizResult_repository.findOneByQuizIdAndUserId(
			quiz_id,
			user_id,

		);
		console.log('submission:', submission);
		if (submission && submission.completedAt) {

			const answers = await this.answerModel
				.find({ user_id, quiz_id })
				.populate('question_id')
				.exec();

			const questions = await this.questionsService.getAllByQuizId(
				quiz_id,
				{ userId: user_id, role: 'ALL' },
				'{"isActive":"true"}',
			);

			return {
				...quizResult,
				questions: answers.length > 0 ? answers : questions.data,
				totalQuestion: questions.data?.length || 0,
			};
		} else {
			return await this.calculate(user_id, quiz_id);
		}
	}



	async findOneByQuizIdAndUserId(
		quiz_id: string,
		user_id: string,
	): Promise<QuizResult | null> {
		return this.quizResult_repository.findOneByQuizIdAndUserId(quiz_id, user_id);
	}

	async calculate(user_id: string, quiz_id: string): Promise<any> {
		const answers = await this.answerModel
			.find({ user_id, quiz_id })
			.populate('question_id')
			.exec();
		console.log('answers:', answers);
		const score = answers.reduce((sum, a) => sum + (typeof a?.score === 'number' ? a.score : 0), 0);

		const questions = await this.questionsService.getAllByQuizId(
			quiz_id,
			{ userId: user_id, role: 'ALL' },
			'{"isActive":"true"}',
		);

		const totalScore = questions.data.reduce((sum, q) => sum + (typeof q.point === 'number' ? q.point : 0), 0);

		console.log('score:', score);
		console.log('totalScore:', totalScore);
		let lastScore = 0;
		if (totalScore !== 0) {

			lastScore = Math.round((score / totalScore) * 10);
		}


		const completedAt = new Date();

		await this.quizResult_repository.updateByQuizAndUserId(
			quiz_id,
			user_id,
			lastScore,
			completedAt,
		);

		const quizResult = await this.quizResult_repository
			.findOne({ quiz_id, user_id })


		return {
			...quizResult,
			questions: answers.length > 0 ? answers : questions.data,
			totalQuestion: questions.data?.length || 0,
		};
	}

	async gradePicture(gradePictureDto: GradePictureDto) {
		const { quiz_result_id, grade: score, feedback } = gradePictureDto;
		try {
			const quiz = await this.quizResult_repository.findById(quiz_result_id);
			if (!quiz) {
				throw new BadRequestException({
					status: HttpStatus.BAD_REQUEST,
					message: 'Không tìm thấy tranh vẽ',
				});
			}
			const grade_quiz = await this.quizResult_repository.update(
				quiz_result_id,
				{
					score,
					feedback,
					completedAt: new Date(),
				},
			);
			return grade_quiz;
		} catch (err) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message: err.message,
			});
		}
	}


	async getMonthlyStats(): Promise<{ month: string; count: number }[]> {
		const now = new Date();
		const start = new Date(now.getFullYear() - 1, now.getMonth(), 1); // 12 tháng trước (bao gồm tháng hiện tại)

		// Lấy dữ liệu theo tháng
		const results = await this.quizResult_repository.aggregateMonthlyCounts(start);

		// Tạo danh sách 12 tháng từ start đến hiện tại
		const months: { month: string; count: number }[] = [];

		for (let i = 0; i <= 12; i++) {
			const date = new Date(start.getFullYear(), start.getMonth() + i, 1);
			const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

			const found = results.find((r) => r._id === key);
			months.push({ month: key, count: found ? found.count : 0 });
		}

		return months;
	}



}
