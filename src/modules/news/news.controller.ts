import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { NewService } from './news.service';
import { CreateNewDto } from './dto/create-new.dto';
import { UpdateNewDto } from './dto/update-new.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { IFile } from 'src/interfaces/file.interface';
import { AwsS3Service } from 'src/services/aws-s3.service';
import { News } from './entities/news.entity';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesEnum } from 'src/enums/roles..enum';
import { JwtAccessTokenGuard } from '@modules/auth/guards/jwt-access-token.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';

@Controller('news')
@ApiTags('news')
export class NewController {
  constructor(
    private readonly newsService: NewService,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new news'})
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(@Body() createNewsDto: CreateNewDto): Promise<News> {
    return await this.newsService.create(createNewsDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrive all news'})
  async findAll() {
    return await this.newsService.findAll();
  }

  @Get('views/total')
  @ApiOperation({ summary: 'Tổng số lượt xem của tất cả tin tức' })
  async getTotalViews() {
    const totalViews = await this.newsService.getTotalViews();
    return totalViews;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrive a news by id'})
  async findOneById(@Param('id') id: string) {
    await this.newsService.increaseView(id);
    return this.newsService.findOneById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a news by ID' })
  update(@Param('id') id: string, @Body() updateNewDto: UpdateNewDto) {
    return this.newsService.update(id, updateNewDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a news by ID' })
  remove(@Param('id') id: string) {
    return this.newsService.delete(id);
  }

  @Patch(':id/isActive')
  @ApiOperation({ summary: 'Set isActive true' })
  async setIsActiveTrue(@Param('id') id: string) {
    return await this.newsService.setIsActiveTrue(id);
  }
}
