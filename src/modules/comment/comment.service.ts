import { PictureService } from '@modules/picture/picture.service';
import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCommnetDto } from './dto/create-commnet.dto';
import { UpdateCommnetDto } from './dto/update-commnet.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Comment } from './entities/commnet.entity';
import { Model } from 'mongoose';
import { StudentsService } from '@modules/students/students.service';
import { CitizensService } from '@modules/citizens/citizens.service';

@Injectable()
export class CommnetService {
	constructor(
		@InjectModel(Comment.name)
		private readonly CommentModel: Model<Comment>,
		private readonly PictureService: PictureService,
		private readonly StudentService: StudentsService,
		private readonly CitizensService: CitizensService,
	) {}

	async create(createCommnetDto: CreateCommnetDto, user_id: string) {
		try {
			const comment = await this.CommentModel.create({
				...createCommnetDto,
				user_id,
			});
			return comment;
		} catch {}
		return 'This action adds a new commnet';
	}

	async findByPicture(picture_id) {
		try {
			const comments = await this.CommentModel.find({ picture_id }).exec();

			const comments_with_user_info = await Promise.all(
				comments?.map(async (comment) => {
					const [student, citizen] = await Promise.all([
						this.StudentService.findOneByCondition(
							{ _id: comment?.user_id },
							'sign-up',
						),
						this.CitizensService.findOneByCondition(
							{ _id: comment?.user_id },
							'sign-up',
						),
					]);

					if (student)
						return {
							...comment.toObject(),
							user_id: student,
						};
					if (citizen)
						return {
							...comment.toObject(),
							user_id: citizen,
						};
				}),
			);
			return comments_with_user_info;
		} catch (error) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message: 'Đã có lỗi xảy ra trong lúc cập nhật, vui lòng thử lại sau',
				details: `Đã có lỗi xảy ra: ${error.message}`,
			});
		}
	}

	findAll() {
		return `This action returns all commnet`;
	}

	findOne(id: number) {
		return `This action returns a #${id} commnet`;
	}

	update(id: number, updateCommnetDto: UpdateCommnetDto) {
		return `This action updates a #${id} commnet`;
	}

	remove(id: number) {
		return `This action removes a #${id} commnet`;
	}
}
