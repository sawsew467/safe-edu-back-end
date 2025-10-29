import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export interface UserContext {
	userId: string;
	role?: string;
	organizationId?: string;
}


@Injectable()
export class RequestContextService {
	private readonly asyncLocalStorage: AsyncLocalStorage<UserContext>;

	constructor() {
		this.asyncLocalStorage = new AsyncLocalStorage<UserContext>();
	}


	run<T>(context: UserContext, callback: () => T): T {
		return this.asyncLocalStorage.run(context, callback);
	}

	getContext(): UserContext | undefined {
		return this.asyncLocalStorage.getStore();
	}


	getUserId(): string | null {
		const context = this.getContext();
		return context?.userId || null;
	}

	getRole(): string | null {
		const context = this.getContext();
		return context?.role || null;
	}


	getOrganizationId(): string | null {
		const context = this.getContext();
		return context?.organizationId || null;
	}


	hasContext(): boolean {
		return this.getContext() !== undefined;
	}
}
