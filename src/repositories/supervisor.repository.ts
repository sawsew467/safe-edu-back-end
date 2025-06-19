import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Supervisor } from '../modules/supervisors/entities/supervisor.entity';
import { SupervisorRepositoryInterface } from '@modules/supervisors/interfaces/supervisors.interface';

@Injectable()
export class SupervisorRepository implements SupervisorRepositoryInterface {
    constructor(
        @InjectModel(Supervisor.name) private readonly supervisor_Model: Model<Supervisor>,
    ) {}
    async findOne(condition: FilterQuery<Supervisor>): Promise<Supervisor | null> {
        return await this.supervisor_Model.findOne(condition)
            .populate('province_id')
            .exec()
    }

    async create(data: Partial<Supervisor>): Promise<Supervisor> {
        console.log('data:', JSON.stringify(data, null, 2));
        
        try {
            const newSupervisor = new this.supervisor_Model(data);
            const savedSupervisor = await newSupervisor.save();
            return savedSupervisor;
          } catch (error) {
            console.error('Error saving new Supervisor:', error.message);
            throw new BadRequestException('Failed to create Supervisor. Please try again.');
          }
    }
    async findAll() {
        const Supervisors = await this.supervisor_Model
          .find()
          .populate('province_id')
          .exec(); 
      
        const total = await this.supervisor_Model.countDocuments().exec();
        return { items: Supervisors, total };
      }
      
    async getSupervisorWithRole(SupervisorId: string): Promise<Supervisor | null> {
        return await this.supervisor_Model.findById(SupervisorId).populate('role').exec();
    }

    async update(id: string, data: Partial<Supervisor>): Promise<Supervisor | null> {
        return await this.supervisor_Model.findByIdAndUpdate(id, data, { new: true })
            .populate('province_id')
            .exec();
    }

    async remove(id: string): Promise<boolean> {
        const result = await this.supervisor_Model.findByIdAndDelete(id).exec();
        return !!result;
    }

    async findOneByCondition(condition: FilterQuery<Supervisor>): Promise<Supervisor | null> {
        try {
            const Supervisor = await this.supervisor_Model.findOne(condition).exec();
            return Supervisor;
        } catch (error) {
            throw error;
        }
    }

    async delete(id: string | Types.ObjectId): Promise<Supervisor | null> {
        const stringId = id instanceof Types.ObjectId ? id.toString() : id;
        return this.supervisor_Model.findByIdAndUpdate(stringId, { deleted_at: new Date(), isActive: false } ,{ new: true })
            .populate('province_id')
            .exec();
    }

}
