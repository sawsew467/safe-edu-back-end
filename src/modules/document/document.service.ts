import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DocumentFile } from './entities/document.entity';
import { CreateDocumentFileDto } from './dto/create-document.dto';
import { UpdateDocumentFileDto } from './dto/update-document.dto';


@Injectable()
export class DocumentFilesService {
  constructor(
    @InjectModel(DocumentFile.name) private model: Model<DocumentFile>,
  ) {}

  async create(dto: CreateDocumentFileDto): Promise<DocumentFile> {
    return this.model.create(dto);
  }

  async findAll(): Promise<DocumentFile[]> {
    return this.model.find().exec();
  }

  async findById(id: string): Promise<DocumentFile | null> {
    return this.model.findById(id).exec();
  }

  async update(
    id: string,
    dto: UpdateDocumentFileDto,
  ): Promise<DocumentFile | null> {
    return this.model.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  async remove(id: string): Promise<DocumentFile | null> {
    return this.model.findByIdAndDelete(id).exec();
  }

  async uploadFile(file: Express.Multer.File): Promise<{ url: string }> {
    // This is a mock. Replace it with your real file uploading logic (e.g., AWS S3, Cloudinary, etc.)
    const mockUrl = `https://your-storage.com/${file.filename}`;
    return { url: mockUrl };
  }
}