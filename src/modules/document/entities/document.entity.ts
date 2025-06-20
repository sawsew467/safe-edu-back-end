import { BaseEntity } from '@modules/shared/base/base.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { NextFunction } from 'express';
import mongoose, { HydratedDocument } from 'mongoose';

export type DocumentFileDocument = HydratedDocument<DocumentFile>;

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  toJSON: {
    getters: true,
    virtuals: true,
  },
})
export class DocumentFile extends BaseEntity {
  constructor(documentFile: { 
    file_name?: string,
    file_url?: string, 
    file_size?: number,
    isUploaded?: boolean,
    document_name: string
  }) 
  {
    super();
    this.document_name = documentFile?.document_name;
    this.file_name = documentFile?.file_name
    this.file_url = documentFile?.file_url;
    this.file_size = documentFile?.file_size;
    this.isUploaded = documentFile?.isUploaded;
  }

  @Prop({})
  document_name: string;

  @Prop({})
  file_name: string;

  @Prop({
    required: true,
    trim: true,
  })
  file_url: string;

  @Prop({})
  file_size: number;

  @Prop()
  isUploaded: boolean;
}

export const DocumentFileSchema = SchemaFactory.createForClass(DocumentFile);
export const DocumentFileSchemaFactory = () => {
  const documentFileSchema = DocumentFileSchema;

  documentFileSchema.pre('findOneAndDelete', async function (next: NextFunction) {
    const document = await this.model.findOne(this.getFilter());
    await Promise.all([]);
    return next();
  });

  return documentFileSchema;
};