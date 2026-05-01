import { Module } from '@nestjs/common';
import { ServiceAddOnsController } from './service-add-ons.controller';
import { ServiceAddOnsService } from './service-add-ons.service';

@Module({
  controllers: [ServiceAddOnsController],
  providers: [ServiceAddOnsService],
})
export class ServiceAddOnsModule {}
