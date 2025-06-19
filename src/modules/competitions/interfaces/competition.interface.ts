import { Citizen } from '@modules/citizens/entities/citizen.entity';
import { FilterQuery } from 'mongoose';
import { Competition } from '../entities/competition.entity';

export interface CompetitionsRepositoryInterface {
    create(data: Partial<Competition>): Promise<Competition>;
    findAll();
    findById(id : string);
    update(id: string, data: Partial<Competition>): Promise<Competition | null>;
    remove(id: string): Promise<Competition | null>;
    countCompetitionsByMonthRaw(): Promise<any[]>;
    findOrganizationIdByQuizId(quizId: string): Promise<Competition>;
}
