import {
	Injectable,
	ExecutionContext,
	UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class OptionalJwtGuard extends AuthGuard('jwt') {
	canActivate(
		context: ExecutionContext,
	): boolean | Promise<boolean> | Observable<boolean> {
		const request = context.switchToHttp().getRequest();
		const authHeader = request.headers.authorization;

		if (!authHeader) {
			return true;
		}

		return super.canActivate(context) as
			| boolean
			| Promise<boolean>
			| Observable<boolean>;
	}

	handleRequest(err: any, user: any, info: any) {
		// If there's JWT-related info/error from passport-jwt
		if (info) {
			const errorName = info.name;

			// Handle token expired
			if (errorName === 'TokenExpiredError') {
				throw new UnauthorizedException('Token đã hết hạn');
			}

			if (errorName === 'JsonWebTokenError') {
				throw new UnauthorizedException('Token không hợp lệ');
			}

			throw new UnauthorizedException('Xác thực không thành công');
		}

		if (err) {
			throw err;
		}

		return user || null;
	}
}
