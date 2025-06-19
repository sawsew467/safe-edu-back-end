
import { DocumentFile, DocumentFileDocument } from '@modules/document/entities/document.entity';
import { DocumentFilesRepositoryInterface } from '@modules/document/interfaces/document.interface';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, Types } from 'mongoose';
import { FindAllResponse } from 'src/types/common.type';


@Injectable()
export class DocumentFilesRepository implements DocumentFilesRepositoryInterface {
  constructor(
    @InjectModel(DocumentFile.name)
    private readonly document_model: Model<DocumentFileDocument>,
  ) {}
    findById(id: string): Promise<DocumentFile | null> {
        throw new Error('Method not implemented.');
    }
    remove(id: string): Promise<DocumentFile | null> {
        throw new Error('Method not implemented.');
    }

  async create(createDto: any): Promise<DocumentFile> {
    const createdDocument = new this.document_model(createDto);
    return createdDocument.save();
  }

  async findAll(): Promise<DocumentFile[]> {
    return this.document_model.find().exec();
  }

  async findOneByCondition(condition: FilterQuery<DocumentFile>): Promise<DocumentFile | null> {
    return this.document_model.findOne(condition).exec();
  }

  async update(id: string | Types.ObjectId, updateData: any): Promise<DocumentFile | null> {
    const stringId = id instanceof Types.ObjectId ? id.toString() : id;
    return this.document_model.findByIdAndUpdate(stringId, updateData, { new: true }).exec();
  }

  async delete(id: string | Types.ObjectId): Promise<DocumentFile | null> {
    const stringId = id instanceof Types.ObjectId ? id.toString() : id;
    return this.document_model.findByIdAndUpdate(stringId, { deleted_at: new Date() }, { new: true }).exec();
  }
}
