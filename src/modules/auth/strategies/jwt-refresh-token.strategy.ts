import { Request } from 'express';
import {
	ForbiddenException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthService } from '../auth.service';
import { TokenPayload } from '../interfaces/token.interface';
import { refresh_token_public_key } from 'src/constraints/jwt.constraint';
import { AdminService } from '@modules/admin/admin.service';
import { StudentsService } from '@modules/students/students.service';
import { CitizensService } from '@modules/citizens/citizens.service';
import { ManagerService } from '@modules/manager/manager.service';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
	Strategy,
	'refresh_token',
) {
	constructor(
		private readonly adminService: AdminService,
		private readonly studentService: StudentsService,
		private readonly citizenService: CitizensService,
		private readonly managerService: ManagerService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: refresh_token_public_key,
			passReqToCallback: true,
		});
	}

	async validate(req: Request, payload: any) {
		const { userId, role } = payload;
		const { exp, ...newPayload } = payload;
		switch (role) {
			case 'Citizen':
				const citizen = await this.citizenService.findOne(userId);
				if (!citizen) {
					throw new UnauthorizedException(
						'Quyền truy cập bị từ chối: Không tìm thấy công dân.',
					);
				}
				break;
			case 'Student':
				const student = await this.studentService.findOne(userId);
				if (!student) {
					throw new UnauthorizedException(
						'Quyền truy cập bị từ chối: Không tìm thấy học sinh.',
					);
				}
				break;
			case 'Admin':
				const admin = await this.adminService.findOneById(userId);
				if (!admin) {
					throw new UnauthorizedException(
						'Quyền truy cập bị từ chối: Không tìm thấy quản trị viên.',
					);
				}
				break;
			case 'Manager':
				const manager = await this.managerService.findOneById(userId);
				if (!manager) {
					throw new UnauthorizedException(
						'Quyền truy cập bị từ chối: Không tìm thấy quản lý.',
					);
				}
				break;
			default:
				throw new ForbiddenException(
					'Quyền truy cập bị từ chối: Vai trò không hợp lệ.',
				);
		}

		return newPayload;
	}
}
