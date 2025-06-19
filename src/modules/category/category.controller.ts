import { ImageUploadService } from './../../services/image-upload.service';
// src/modules/categories/categories.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { IFile } from 'src/interfaces/file.interface';
import { AwsS3Service } from 'src/services/aws-s3.service';
import { JwtAccessTokenGuard } from '@modules/auth/guards/jwt-access-token.guard';
import { Public } from 'src/decorators/auth.decorator';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { FileUploadDto } from '@modules/topic/dto/file-upload.dto';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly awsS3Service: AwsS3Service,
    private readonly imageUploadService: ImageUploadService,
  ) { }
  private readonly logger = new Logger(CategoriesController.name);

  @Post('upload-image')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Image upload',
    type: FileUploadDto,
  })
  @Public()
  @UseGuards(JwtAccessTokenGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: IFile) {
    try {
  
      const uploadResult = await this.awsS3Service.uploadImage(file);
      // this.logger.log('Image uploaded successfully', uploadResult);
      return {
        statusCode: HttpStatus.OK,
        message: 'Image uploaded successfully',
        success: true,
        data: uploadResult,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Image upload failed',
          success: false,
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('upload-buffer')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Image upload from buffer',
    type: FileUploadDto,
  })
  @Public()
  @UseGuards(JwtAccessTokenGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImageFromBuffer(@UploadedFile() file: IFile) {
    try {
      // this.logger.log('Uploading image to S3');
      // this.logger.log(file);
      const uploadResult = await this.awsS3Service.uploadImageFromBuffer(
        file.buffer,
        file.mimetype,
      );
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Image uploaded successfully via buffer',
        success: true,
        data: uploadResult,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Image upload failed',
          success: false,
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }



  @Post()
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    const createdCategory = await this.categoryService.create(createCategoryDto);
  }

  @Get()
  async findAll() {
    return this.categoryService.findAll();
  }

  @Get('views/total')
  @ApiOperation({ summary: 'Tổng số lượt xem của tất cả category' })
  async getTotalViews() {
    const totalViews = await this.categoryService.getTotalViews();
    return totalViews;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    await this.categoryService.increaseView(id);
    return this.categoryService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(id, updateDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.categoryService.delete(id);
  }
}
