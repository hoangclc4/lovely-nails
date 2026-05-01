import { Module } from '@nestjs/common';
import { ServiceSessionsController } from './service-sessions.controller';
import { ServiceSessionsService } from './service-sessions.service';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [ServiceSessionsController],
  providers: [ServiceSessionsService],
})
export class ServiceSessionsModule {}
