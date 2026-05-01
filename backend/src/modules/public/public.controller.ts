import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { PublicService } from './public.service';
import {
  publicAvailabilityQuerySchema,
  publicCreateBookingSchema,
  type PublicAvailabilityQueryDto,
  type PublicCreateBookingDto,
} from './schemas/public.schemas';

@ApiTags('public')
@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Public()
  @Get('services')
  getServices() {
    return this.publicService.getServices();
  }

  @Public()
  @Get('availability')
  checkAvailability(
    @Query(new ZodValidationPipe(publicAvailabilityQuerySchema)) query: PublicAvailabilityQueryDto,
  ) {
    return this.publicService.getAvailableEmployees(query);
  }

  @Public()
  @Post('bookings')
  createBooking(
    @Body(new ZodValidationPipe(publicCreateBookingSchema)) dto: PublicCreateBookingDto,
  ) {
    return this.publicService.createPublicBooking(dto);
  }
}
