import {
    Controller,
    Post,
    Get,
    Param,
    Delete,
    Patch,
    Body,
    UploadedFile,
    UseInterceptors,
    HttpStatus,
    HttpException,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DocumentFilesService } from './document.service';
import { CreateDocumentFileDto } from './dto/create-document.dto';
import { UpdateDocumentFileDto } from './dto/update-document.dto';
import { UploadFileService } from 'src/services/file-upload.service';
import { IFile } from 'src/interfaces/file.interface';
import { FileUploadDto } from '@modules/topic/dto/file-upload.dto';


@ApiTags('Document Files')
@ApiBearerAuth('token')
@Controller('document-files')
export class DocumentFilesController {
    constructor(private readonly documentFilesService: DocumentFilesService,
        private readonly uploadFileService: UploadFileService
    ) { }

    @Post('upload')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'File upload',
        type: FileUploadDto,
    })

    @UseInterceptors(FileInterceptor('image'))
    async uploadFile(@UploadedFile() file: IFile) {
        try {
            const uploadResult = await this.uploadFileService.uploadFile(file);
            const sizeInKB = Number((file.size / 1024).toFixed(2));
            const fileName  = file.originalname;
            const createDto: CreateDocumentFileDto = {
                file_name: fileName ,
                file_url: uploadResult,
                file_size: sizeInKB,
            };
            const createdDocument = await this.documentFilesService.create(createDto);
            return {
                statusCode: HttpStatus.OK,
                message: 'File uploaded successfully',
                success: true,
                data: createdDocument,
            };
        } catch (error) {
            throw new HttpException(
                {
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: 'File upload failed',
                    success: false,
                    error: error.message,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post()
    async create(@Body() dto: CreateDocumentFileDto) {
        return this.documentFilesService.create(dto);
    }

    @Get()
    async findAll() {
        return this.documentFilesService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.documentFilesService.findById(id);
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateDocumentFileDto,
    ) {
        return this.documentFilesService.update(id, dto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.documentFilesService.remove(id);
    }
}
