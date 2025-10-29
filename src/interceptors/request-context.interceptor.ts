import {
	Injectable,
	NestInterceptor,
	ExecutionContext,
	CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { RequestContextService } from '@modules/shared/context/request-context.service';

/**
 * RequestContextInterceptor - Capture user context và lưu vào AsyncLocalStorage
 *
 * Interceptor này chạy SAU Guards, nên req.user đã có sẵn khi interceptor chạy
 *
 * Flow:
 * - Nếu có user (authenticated) → Set context với userId
 * - Nếu không có user (anonymous) → Skip context
 * - Context tự động available trong toàn bộ request lifecycle
 */
@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
	constructor(private readonly contextService: RequestContextService) {}

	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const request = context.switchToHttp().getRequest();
		const user = request.user;

		// Nếu có user (authenticated request)
		if (user && user.userId) {
			// Wrap execution trong AsyncLocalStorage context
			return new Observable((subscriber) => {
				this.contextService.run(
					{
						userId: user.userId,
						role: user.role,
						organizationId: user.organizationId,
					},
					() => {
						// Execute handler với context
						next.handle().subscribe({
							next: (value) => subscriber.next(value),
							error: (err) => subscriber.error(err),
							complete: () => subscriber.complete(),
						});
					},
				);
			});
		} else {
			// Không có user → anonymous request
			return next.handle();
		}
	}
}
