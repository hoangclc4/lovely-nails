import { Module } from '@nestjs/common';
import { SalonScheduleController } from './salon-schedule.controller';
import { SalonScheduleService } from './salon-schedule.service';

@Module({
  controllers: [SalonScheduleController],
  providers: [SalonScheduleService],
})
export class SalonScheduleModule {}
