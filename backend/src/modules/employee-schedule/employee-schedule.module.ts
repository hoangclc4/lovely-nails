import { Module } from '@nestjs/common';
import { EmployeeScheduleController } from './employee-schedule.controller';
import { EmployeeScheduleService } from './employee-schedule.service';

@Module({
  controllers: [EmployeeScheduleController],
  providers: [EmployeeScheduleService],
})
export class EmployeeScheduleModule {}
