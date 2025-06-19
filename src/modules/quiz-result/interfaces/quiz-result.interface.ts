import { QuizResult } from '@modules/quiz-result/entities/quiz-result.entity';
import { FilterQuery, ObjectId, Types } from 'mongoose';


export interface QuizResultRepositoryInterface {
    create(data: Partial<QuizResult>): Promise<QuizResult>;
    findAll(
        filterRaw: string,
        searchPhase: string,
        page: number,
        limit: number,
        sortBy: string,
        sortOrder: 'asc' | 'desc',
    ): Promise<any>
    update(id: string, data: Partial<QuizResult>): Promise<QuizResult | null>;
    remove(id: string | Types.ObjectId): Promise<QuizResult | null>;
    findOne(condition: FilterQuery<QuizResult>): Promise<QuizResult | null>;
    findById(id: string)
    findOneByQuizId(quiz_id: string): Promise<any>
    updateByQuizAndUserId(
        quiz_id: string,
        user_id: string,
        score: number,
        completedAt: Date,
    ): Promise<QuizResult | null>
    findOneByQuizIdAndUserId(
    quiz_id: string,
    user_id: string,
  ): Promise<QuizResult | null> 
  aggregateMonthlyCounts(start: Date): Promise<{ _id: string; count: number }[]>;

}
