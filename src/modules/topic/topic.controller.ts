import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { IFile } from 'src/interfaces/file.interface';

import { JwtAccessTokenGuard } from '@modules/auth/guards/jwt-access-token.guard';
import { Public } from 'src/decorators/auth.decorator';
import { TopicsService } from '@modules/topic/topic.service';
import { CreateTopicDto } from '@modules/topic/dto/create-topic.dto';
import { UpdateTopicDto } from '@modules/topic/dto/update-topic.dto';
import { ImageUploadService } from 'src/services/image-upload.service';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { FileUploadDto } from '@modules/topic/dto/file-upload.dto';


@Controller('topics')
export class TopicsController {
  constructor(
    private readonly topicsService: TopicsService,
    private readonly imageUploadService: ImageUploadService,
  ) { }



  @Post()
  @Public()
  @UseGuards(JwtAccessTokenGuard)
  async create(@Body() { topic_name, description }: CreateTopicDto) {
    try {
      const createTopicDto: CreateTopicDto = { topic_name, description };
      const createdTopic = await this.topicsService.create(createTopicDto);

      return {
        statusCode: HttpStatus.OK,
        message: 'Topic created successfully',
        success: true,
        data: createdTopic,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Topic creation failed',
          success: false,
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  @Put(':id')
  @Public()
  @UseGuards(JwtAccessTokenGuard)
  async update(
    @Param('id') id: string,
    @Body() { topic_name, description }: UpdateTopicDto,
  ) {
    try {
      const updateDto: UpdateTopicDto = { topic_name, description };
      const updatedTopic = await this.topicsService.update(id, updateDto);

      return {
        statusCode: HttpStatus.OK,
        message: 'Topic updated successfully',
        success: true,
        data: updatedTopic,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Topic update failed',
          success: false,
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('views/total')
  @ApiOperation({ summary: 'Tổng số lượt xem của tất cả category' })
  async getTotalViews() {
    const totalViews = await this.topicsService.getTotalViews();
    return totalViews; // interceptor sẽ tự wrap
  }


  @Delete(':id')
  @Public()
  @UseGuards(JwtAccessTokenGuard)
  async delete(@Param('id') id: string) {
    return this.topicsService.delete(id);
  }


  @Get()
  @Public()
  @UseGuards(JwtAccessTokenGuard)
  async findAll() {
    return this.topicsService.findAll();
  }


  @Get(':id')
  @Public()
  @UseGuards(JwtAccessTokenGuard)
  async findOne(@Param('id') id: string) {
    return this.topicsService.findOne(id);
  }
}
