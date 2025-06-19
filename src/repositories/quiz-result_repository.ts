import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, Types } from 'mongoose';
import { FindAllResponse, QueryParams } from 'src/types/common.type';
import { Topic, TopicDocument } from '@modules/topic/entities/topic.entity';
import { QuizResult } from '@modules/quiz-result/entities/quiz-result.entity';
import { QuizResultRepositoryInterface } from '@modules/quiz-result/interfaces/quiz-result.interface';


@Injectable()
export class QuizResultRepository implements QuizResultRepositoryInterface {
    constructor(
        @InjectModel(QuizResult.name)
        private readonly quizResult_model: Model<QuizResult>,
    ) { }
    remove(id: string | Types.ObjectId): Promise<QuizResult | null> {
        throw new Error('Method not implemented.');
    }
    async findOne(condition: FilterQuery<QuizResult>): Promise<QuizResult | null> {
        try {
            const quizResult = await this.quizResult_model
                .findOne(condition)
                .populate('quiz_id')
                .exec();
            console.log('quizResult', quizResult);
            return quizResult?.toObject();
        } catch (error) {
            throw new BadRequestException({
                status: HttpStatus.BAD_REQUEST,
                message: 'Đã có lỗi xảy ra trong lúc tìm kiếm, vui lòng thử lại sau',
                details: `Đã có lỗi xảy ra: ${error.message}`,
            });
        }
    }

    async findOneByQuizId(quiz_id: string): Promise<any> {
        try {
            const quizResult = await this.quizResult_model
                .find({ quiz_id })
                .populate('quiz_id')
                .exec();
            return quizResult;
        } catch (error) {
            throw new BadRequestException({
                status: HttpStatus.BAD_REQUEST,
                message: 'Đã có lỗi xảy ra trong lúc tìm kiếm, vui lòng thử lại sau',
                details: `Đã có lỗi xảy ra: ${error.message}`,
            });
        }
    }

    async findById(id: string): Promise<QuizResult | null> {
        return this.quizResult_model
            .findById(id)
            .populate('quiz_id')
            .exec();
    }   

    async create(createDto: any): Promise<QuizResult> {
        const createdQuizResult = new this.quizResult_model(createDto);
        return createdQuizResult.save(); // Save the new topic and return the saved document
    }
    // The findAll method to fetch all topics with optional pagination

    // Find one topic by condition
    async findOneByCondition(condition: FilterQuery<QuizResult>): Promise<QuizResult | null> {
        return this.quizResult_model.findOne(condition).exec();
    }

    // Update topic by ID
    async update(id: string | Types.ObjectId, updateData: any): Promise<QuizResult | null> {
        const stringId = id instanceof Types.ObjectId ? id.toString() : id;
        return this.quizResult_model.findByIdAndUpdate(stringId, updateData, { new: true }).exec();
    }

    // Soft delete topic by ID (mark as deleted)
    async delete(id: string | Types.ObjectId): Promise<QuizResult | null> {
        const stringId = id instanceof Types.ObjectId ? id.toString() : id;
        return this.quizResult_model.findByIdAndUpdate(stringId, { deleted_at: new Date() }, { new: true }).exec();
    }

    async findOneByQuizIdAndUserId(
        quiz_id: string,
        user_id: string,
    ): Promise<QuizResult | null> {
        
        return await this.quizResult_model.findOne({ quiz_id, user_id }).exec();;
    }

    async updateByQuizAndUserId(
        quiz_id: string,
        user_id: string,
        score: number,
        completedAt: Date,
    ): Promise<QuizResult | null> {


        if (isNaN(score)) {
            throw new BadRequestException('Score calculation failed (NaN)');
        }

        return await this.quizResult_model.findOneAndUpdate(
            { quiz_id, user_id },
            {
                score: score,
                completedAt: completedAt,
            },
            { new: true },
        ).exec();
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
                filter = JSON.parse(filterRaw);
            }
            if (searchPhase) {
                if (filter.$or) {
                    filter.$or.push(
                        { name: new RegExp(searchPhase, 'i') },
                        { description: new RegExp(searchPhase, 'i') },
                    );
                } else
                    filter.$or = [
                        { name: new RegExp(searchPhase, 'i') },
                        { description: new RegExp(searchPhase, 'i') },
                    ];
            }

            const validPage = Number(page) > 0 ? Number(page) : 1;
            const validLimit = Number(limit) > 0 ? Number(limit) : 10;
            const skip = (validPage - 1) * validLimit;
            const sortDirection = sortOrder === 'asc' ? 1 : -1;

            const users = await this.quizResult_model
                .find(filter)
                .skip(skip)
                .limit(limit)
                .sort({ [sortBy]: sortDirection })
                .populate('quiz_id')
                .exec();

            const totalItemCount = await this.quizResult_model
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

    async aggregateMonthlyCounts(start: Date): Promise<{ _id: string; count: number }[]> {
        return this.quizResult_model.aggregate([
            {
                $match: {
                    created_at: { $gte: start },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m', date: '$created_at' },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { _id: 1 },
            },
        ]);
    }


}
