import { Module, Global } from '@nestjs/common';
import { RequestContextService } from './context/request-context.service';

@Global()
@Module({
	providers: [RequestContextService],
	exports: [RequestContextService],
})
export class SharedModule {}
