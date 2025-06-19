import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from '../interfaces/token.interface';
import { access_token_public_key } from 'src/constraints/jwt.constraint';

import { AdminService } from '@modules/admin/admin.service';
import { StudentsService } from '@modules/students/students.service';
import { CitizensService } from '@modules/citizens/citizens.service';

import { UnauthorizedException } from '@nestjs/common';
import { ManagerService } from '@modules/manager/manager.service';

@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor(
		private readonly adminService: AdminService,
		private readonly studentService: StudentsService,
		private readonly citizenService: CitizensService,
		private readonly managerService: ManagerService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: access_token_public_key,
		});
	}

	async validate(payload: TokenPayload) {
		const { userId, role } = payload;

		switch (role) {
			case 'Citizen':
				const citizen = await this.citizenService.findOne(userId);
				if (!citizen) {
					throw new UnauthorizedException(
						'Quyền truy cập bị từ chối: Không tìm thấy công dân.',
					);
				}

				if (!citizen.isActive) {
					throw new UnauthorizedException(
						'Quyền truy cập bị từ chối: Tài khoản của bạn đã bị khóa.',
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
				if (!student.isActive) {
					throw new UnauthorizedException(
						'Quyền truy cập bị từ chối: Tài khoản của bạn đã bị khóa.',
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
				if (!admin.isActive) {
					throw new UnauthorizedException(
						'Quyền truy cập bị từ chối: Tài khoản của bạn đã bị khóa.',
					);
				}
				break;
			case 'Manager':
			
				const manager = await this.managerService.findOneById(userId);
				if (!manager) {
					throw new UnauthorizedException(
						'Quyền truy cập bị từ chối: Không tìm thấy người quản lý.',
					);
				}
				if (!manager.isActive) {
					throw new UnauthorizedException(
						'Quyền truy cập bị từ chối: Tài khoản của bạn đã bị khóa.',
					);
				}
				break;
			default:
				throw new UnauthorizedException(
					'Quyền truy cập bị từ chối: Vai trò không hợp lệ.',
				);
		}

		return payload;
	}
}
