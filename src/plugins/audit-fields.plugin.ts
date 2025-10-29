import { Schema } from 'mongoose';
import { RequestContextService } from '@modules/shared/context/request-context.service';

let contextServiceInstance: RequestContextService;

export function initializeAuditPlugin(contextService: RequestContextService) {
	contextServiceInstance = contextService;
}

export function auditFieldsPlugin(schema: Schema) {
	schema.pre('save', function (next) {
		if (!contextServiceInstance) {
			return next();
		}

		const userId = contextServiceInstance.getUserId();

		if (userId) {
			if (this.isNew && !this.created_by) {
				this.created_by = userId;
			}

			this.update_by = userId;
		}

		next();
	});

	const preUpdateHandler = function (this: any, next: any) {
		if (!contextServiceInstance) {
			return next();
		}

		const userId = contextServiceInstance.getUserId();

		if (userId) {
			this.set({ update_by: userId });
		}

		next();
	};

	schema.pre('updateOne', preUpdateHandler);
	schema.pre('updateMany', preUpdateHandler);

	schema.pre('findOneAndUpdate', function (next) {
		if (!contextServiceInstance) {
			return next();
		}

		const userId = contextServiceInstance.getUserId();

		if (userId) {
			// Get update data
			const update = this.getUpdate() as any;

			// Nếu là upsert operation và document mới, set created_by
			if (
				this.getOptions().upsert &&
				!update.created_by &&
				!update.$set?.created_by
			) {
				if (update.$setOnInsert) {
					update.$setOnInsert.created_by = userId;
				} else {
					update.$setOnInsert = { created_by: userId };
				}
			}

			if (update.$set) {
				update.$set.update_by = userId;
			} else if (!update.update_by) {
				update.update_by = userId;
			}

			this.setUpdate(update);
		}

		next();
	});

	// Pre-insertMany hook: Xử lý khi insertMany()
	schema.pre('insertMany', function (next, docs: any[]) {
		if (!contextServiceInstance) {
			return next();
		}

		const userId = contextServiceInstance.getUserId();

		if (userId && Array.isArray(docs)) {
			docs.forEach((doc) => {
				if (!doc.created_by) {
					doc.created_by = userId;
				}
				doc.update_by = userId;
			});
		}

		next();
	});
}
