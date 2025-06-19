import { QuizService } from './../quiz/quiz.service';
import { CompetitionsService } from './../competitions/competitions.service';
import { QuizResultService } from '@modules/quiz-result/quiz-result.service';
import {
	BadRequestException,
	ConflictException,
	HttpStatus,
	Inject,
	Injectable,
} from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Question } from './entities/question.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QuizResult } from '@modules/quiz-result/entities/quiz-result.entity';
import { Quiz } from '@modules/quiz/entities/quiz.entity';
import { Competition } from '@modules/competitions/entities/competition.entity';
import * as AdmZip from 'adm-zip';
import * as XLSX from 'xlsx';
import * as mime from 'mime-types';
import * as path from 'path';
import * as fs from 'fs';
import * as pathModule from 'path';
import { AwsS3Service } from 'src/services/aws-s3.service';
import { IFile } from 'src/interfaces/file.interface';
import { shuffle } from 'lodash';
@Injectable()
export class QuestionsService {
	constructor(
		@InjectModel(Question.name)
		private readonly questionModel: Model<Question>,
		@InjectModel(QuizResult.name)
		private readonly quizResultModel: Model<QuizResult>,
		@InjectModel(Quiz.name)
		private readonly quizModel: Model<Quiz>,
		private readonly awsS3Service: AwsS3Service,
	) { }

	async create(createQuestionDto: CreateQuestionDto): Promise<any> {
		const { question } = createQuestionDto;
		try {
			let data = await this.questionModel.create(createQuestionDto);
			if (!question)
				data = await this.questionModel.findByIdAndUpdate(data._id, {
					isActive: false,
				});
			return data;
		} catch (error) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message: 'Đã có lỗi xảy ra khi tạo câu hỏi, vui lòng thử lại sau',
				details: `Có lỗi xảy ra khi tạo câu hỏi: ${error.message}`,
			});
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

			const questions = await this.questionModel
				.find(filter)
				.skip(skip)
				.limit(validLimit)
				.sort({ [sortBy]: sortDirection })
				.populate('quiz_id')
				.lean()
				.exec();

			// Xáo trộn câu trả lời cho mỗi câu hỏi
			const shuffledQuestions = questions.map((q) => {
				const shuffled = shuffle(q.answer);
				return {
					...q,
					answer: shuffled,

				};
			});

			const totalItemCount = await this.questionModel.countDocuments(filter).exec();
			const totalPages = totalItemCount > 0 ? Math.ceil(totalItemCount / validLimit) : 1;
			const itemFrom = totalItemCount === 0 ? 0 : skip + 1;
			const itemTo = Math.min(skip + validLimit, totalItemCount);

			return {
				items: shuffledQuestions,
				totalItemCount,
				totalPages,
				itemFrom,
				itemTo,
			};
		} catch (error) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message: 'Đã có lỗi xảy ra trong quá trình xem câu hỏi, vui lòng thử lại sau',
				details: `Đã có lỗi xảy ra: ${error.message}`,
			});
		}
	}
	async findOneById(_id: string): Promise<any> {
		try {
			const question = await this.questionModel
				.findById(_id)
				.populate('quiz_id')
				.lean() // dùng lean() để trả về plain object có thể chỉnh sửa
				.exec();

			if (!question) {
				throw new BadRequestException('Không tìm thấy câu hỏi');
			}

			// Xáo trộn câu trả lời
			const originalAnswers = question.answer;
			const shuffledAnswers = shuffle(originalAnswers);


			question.answer = shuffledAnswers;

			return question;
		} catch (error) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message: 'Đã có lỗi xảy ra trong lúc tìm kiếm, vui lòng thử lại sau',
				details: `Đã có lỗi xảy ra: ${error.message}`,
			});
		}
	}


	async update(
		_id: string,
		updateQuestionDto: UpdateQuestionDto,
	): Promise<any> {
		try {
			const existed_question = await this.questionModel.findById(_id).exec();
			if (!existed_question) {
				throw new BadRequestException({
					status: HttpStatus.BAD_REQUEST,
					message: 'Không tìm thấy câu hỏi để cập nhật, vui lòng thử lại sau',
				});
			}
			if (updateQuestionDto.question !== '')
				await this.questionModel.findByIdAndUpdate(_id, {
					...updateQuestionDto,
					isActive: true,
				});

			const updated_question = await this.questionModel.findOne({ _id });
			return updated_question;
		} catch (error) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message: 'Đã có lỗi xảy ra trong lúc cập nhật, vui lòng thử lại sau',
				details: `Đã có lỗi xảy ra: ${error.message}`,
			});
		}
	}

	async remove(_id: string) {
		try {
			const existed_question = await this.questionModel.findById(_id).exec();
			await this.questionModel.findByIdAndDelete(_id);
		} catch (error) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message: 'Đã có lỗi xảy ra trong lúc xóa, vui lòng thử lại sau',
				details: `Đã có lỗi xảy ra: ${error.message}`,
			});
		}
	}

	async getAllByQuizId(
		quizId: string,
		{ userId, role }: { userId: string; role: string },
		filterRaw: string = '',
	) {
		if (role === 'Student' || role === 'Citizen') {
			const exist_quiz_result = await this.quizResultModel.findOne({
				quiz_id: quizId,
				user_id: userId,
			});

			const quiz = await this.quizModel
				.findOne({
					_id: quizId,
				})
				.populate('competitionId')
				.exec();

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

			if (exist_quiz_result)
				throw new ConflictException({
					status: HttpStatus.CONFLICT,
					message: 'Bạn đã làm bài này rồi',
					details: 'Bạn đã làm bài này rồi',
				});
			else {
				const quiz_reuslt = await this.quizResultModel.create({
					quiz_id: quizId,
					user_id: userId,
					startAt: new Date(),
				});
			}
		}
		try {
			
			await this.questionModel.updateMany(
				{ quiz_id: quizId, correct_answer: { $ne: '' } },
				{ $set: { isActive: true } }
			);
			await this.questionModel.updateMany(
				{ quiz_id: quizId, $or: [{ correct_answer: '' }, { correct_answer: { $exists: false } }] },
				{ $set: { isActive: false } }
			);

			let filter = null;
			if (filterRaw) {
				filter = JSON.parse(filterRaw);
			}

			if (filter) {
				filter.quiz_id = quizId;
			} else {
				filter = {
					quiz_id: quizId,
				};
			}

			const questions = await this.questionModel
				.find(filter)
				.populate('quiz_id')
				.exec();

			const shuffledQuestions = questions.sort(() => Math.random() - 0.5).map((q) => {
				const shuffledAnswers = shuffle(q.answer);
				return {
					...q.toObject?.() ?? q,
					answer: shuffledAnswers,
				};
			});

			return {
				status: HttpStatus.OK,
				message: 'Lấy danh sách câu hỏi theo quiz thành công',
				data: shuffledQuestions,
			};
		} catch (error) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message: 'Đã có lỗi xảy ra khi lấy câu hỏi theo quiz',
				details: `Lỗi: ${error.message}`,
			});
		}

	}

	async importQuestionsFromZipFile(file: Express.Multer.File, quizId: string) {
		try {
			const zip = new AdmZip(file.buffer);
			const zipEntries = zip.getEntries();
			const excelEntry = zipEntries.find((entry) =>
				entry.entryName.endsWith('.xlsx'));

			if (!excelEntry) {
				throw new BadRequestException({
					status: HttpStatus.BAD_REQUEST,
					message: 'Không tìm thấy file excel trong file zip',
				});
			}

			const workbook = XLSX.read(excelEntry.getData(), { type: 'buffer' });
			const sheet = workbook.Sheets[workbook.SheetNames[0]];
			const rows = XLSX.utils.sheet_to_json(sheet);

			for (const row of rows) {
				let imageUrl = null;
				if (row['Ảnh minh họa']) {
					const imgEntry = zipEntries.find((entry) =>
						entry.entryName.endsWith(row['Ảnh minh họa'])
					);

					if (!imgEntry) {
						throw new Error(`Không tìm thấy ảnh minh họa: ${row['Ảnh minh họa']}`);
					}
					const fileData: IFile = {
						encoding: '7bit',
						buffer: imgEntry.getData(),
						fieldname: 'file',
						mimetype: 'image/jpeg',
						originalname: imgEntry.entryName,
						size: imgEntry.getData().length,
					};

					imageUrl = await this.awsS3Service.uploadImage(fileData);
				}

				const answers = [
					row['Đáp án A'],
					row['Đáp án B'],
					row['Đáp án C'],
					row['Đáp án D'],
				];

				const correctIndex = row['Đáp án đúng'].toString().toUpperCase().charCodeAt(0) - 65; // 'A' -> 0, 'B' -> 1...
				const correctAnswer = answers[correctIndex];

				const question = new this.questionModel({
					quiz_id: quizId,
					question: row['Câu hỏi'],
					answer: answers,
					correct_answer: correctAnswer,
					image: imageUrl,
					time_limit: Number(row['Giới hạn thời gian (giây)']) || 0,
					multiplier: Number(row['Điểm nhân']) || 1,
				});

				await question.save();
			}

			return {
				status: HttpStatus.OK,
				message: 'Import câu hỏi thành công',
			};
		} catch (error) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message: 'Đã có lỗi xảy ra khi import câu hỏi từ file zip',
				details: `Lỗi: ${error.message}`,
			});
		}
	}
}
