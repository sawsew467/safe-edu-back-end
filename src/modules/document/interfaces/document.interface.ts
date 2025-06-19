import { DocumentFile } from "@modules/document/entities/document.entity";


export interface DocumentFilesRepositoryInterface {
  create(data: Partial<DocumentFile>): Promise<DocumentFile>;
  findAll(): Promise<DocumentFile[]>;
  findById(id: string): Promise<DocumentFile | null>;
  update(id: string, data: Partial<DocumentFile>): Promise<DocumentFile | null>;
  remove(id: string): Promise<DocumentFile | null>;
}
