import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { Model } from 'mongoose';
import { Submission } from './entities/submission.entity';
import { InjectModel } from '@nestjs/mongoose';
import { ERRORS_DICTIONARY } from 'src/constraints/error-dictionary.constraint';
import { Question } from '@modules/questions/entities/question.entity';

@Injectable()
export class SubmissionService {
	constructor(
		@InjectModel(Submission.name)
		private readonly submissionModel: Model<Submission>,
		@InjectModel(Question.name)
		private readonly questionModel: Model<Question>,
	) { }

	async submitAnswer(
		createSubmissionDto: CreateSubmissionDto,
		user_id: string,
	) {
		try {
			const { question_id, answer } = createSubmissionDto;
			// console.log('answer:', answer)
			// console.log('qestion_id:', question_id)
			const existing = await this.submissionModel.findOne({
				user_id,
				question_id,
			});
		
			if (existing !== null) {	
				// console.log('existing:', existing);
				return {
					message: 'Bạn đã trả lời câu hỏi này rồi.',
					isCorrect: existing.isCorrect,
					score: existing.score,
				};
			}

			const question = await this.questionModel.findById(question_id);
			// console.log('first question:', question);
			if (!question) {
				return {
					message: 'Câu hỏi không tồn tại.',
				};
			}
			
			const isCorrect = question.correct_answer === answer;
			// console.log('isCorrect:', isCorrect);
			const score = isCorrect ? question.point : 0;
			// console.log('score:', score);
			const submit = new this.submissionModel({
				question_id,
				quiz_id: question.quiz_id,
				user_id,
				answer,
				isCorrect,
				score,
			});

			await submit.save();
			console.log('submit:', submit);
			return {
				message: 'Trả lời thành công.',
				isCorrect,
				score,
			};
		} catch (error) {
			return {
				message: 'Lỗi server.',
				error: error.message,
			};
		}
	}


	async findAll(
		searchPhase: string = '',
		page: number = 1,
		limit: number = 10,
		sortBy: string = 'createdAt',
		sortOrder: 'asc' | 'desc' = 'asc',
	): Promise<any> {
		try {
			const filter: any = {};
			if (searchPhase) {
				filter.$or = [
					{ name: new RegExp(searchPhase, 'i') },
					{ description: new RegExp(searchPhase, 'i') },
				];
			}

			const validPage = Number(page) > 0 ? Number(page) : 1;
			const validLimit = Number(limit) > 0 ? Number(limit) : 10;
			const skip = (validPage - 1) * validLimit;
			const sortDirection = sortOrder === 'asc' ? 1 : -1;

			const users = await this.submissionModel
				.find(filter)
				.skip(skip)
				.limit(limit)
				.sort({ [sortBy]: sortDirection })
				.populate('question_id')
				.populate('user_id')
				.exec();

			const totalItemCount = await this.submissionModel
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
					'Đã có lỗi xảy ra trong quá trình xem câu hỏi, vui lòng thử lại sau',
				details: `Đã có lỗi xảy ra: ${error.message}`,
			});
		}
	}

	async findOneByUserId(userId: string) {
		try {
			const userSubmission = await this.submissionModel.findOne({
				user_id: userId,
			});

			return userSubmission;
		} catch (error) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message:
					'Đã có lỗi xảy ra trong quá trình xem câu hỏi, vui lòng thử lại sau',
				details: `Đã có lỗi xảy ra: ${error.message}`,
			});
		}
	}
}
