import { RegistrationWithStudent, RegistrationWithStudentDocument } from '@modules/registration-with-student/entities/registration-with-student.entity';
import { RegistrationWithStudentRepositoryInterface } from '@modules/registration-with-student/interfaces/registeration-with-student.interface';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';


@Injectable()
export class RegistrationWithStudentRepository implements RegistrationWithStudentRepositoryInterface {
  constructor(
    @InjectModel(RegistrationWithStudent.name) private readonly registrationModel: Model<RegistrationWithStudentDocument>,
  ) {}

  async findOne(condition: FilterQuery<RegistrationWithStudent>): Promise<RegistrationWithStudent | null> {
    try {
      return await this.registrationModel.findOne(condition).exec();
    } catch (error) {
      throw new BadRequestException(`Error finding registration: ${error.message}`);
    }
  }

  async create(data: Partial<RegistrationWithStudent>): Promise<RegistrationWithStudent> {
    try {
      const newRegistration = new this.registrationModel(data);
      return await newRegistration.save();
    } catch (error) {
      throw new BadRequestException(`Failed to create registration: ${error.message}`);
    }
  }

  async findAll(): Promise<{ items: RegistrationWithStudent[]; total: number }> {
    try {
      const items = await this.registrationModel.find().exec();
      const total = await this.registrationModel.countDocuments().exec();
      return { items, total };
    } catch (error) {
      throw new BadRequestException(`Error fetching registrations: ${error.message}`);
    }
  }

  async update(id: string, data: Partial<RegistrationWithStudent>): Promise<RegistrationWithStudent | null> {
    try {
      return await this.registrationModel.findByIdAndUpdate(id, data, { new: true }).exec();
    } catch (error) {
      throw new BadRequestException(`Failed to update registration: ${error.message}`);
    }
  }

  async remove(id: string): Promise<boolean> {
    try {
      const result = await this.registrationModel.findByIdAndDelete(id).exec();
      return !!result;
    } catch (error) {
      throw new BadRequestException(`Failed to delete registration: ${error.message}`);
    }
  }

  // Soft delete example (if needed)
  async softDelete(id: string | Types.ObjectId): Promise<RegistrationWithStudent | null> {
    try {
      const stringId = id instanceof Types.ObjectId ? id.toString() : id;
      return await this.registrationModel.findByIdAndUpdate(
        stringId,
        { deleted_at: new Date(), isActive: false },
        { new: true }
      ).exec();
    } catch (error) {
      throw new BadRequestException(`Failed to soft delete registration: ${error.message}`);
    }
  }
}
