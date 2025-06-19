import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/decorators/roles.decorator';
import { CitizensService } from '@modules/citizens/citizens.service';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredRoles = this.reflector.getAllAndOverride<string[]>(
			ROLES_KEY,
			[context.getHandler(), context.getClass()],
		);

		if (!requiredRoles) {
			return true;
		}

		const { user } = context.switchToHttp().getRequest();

		if (!user) {
			throw new UnauthorizedException(
				'Quyền truy cập bị từ chối: Không tìm thấy người dùng.',
			);
		}

		if (!requiredRoles.includes(user.role)) {
			throw new UnauthorizedException(
				'Quyền truy cập bị từ chối: Vai trò không đủ.',
			);
		}

		return true;
	}
}
