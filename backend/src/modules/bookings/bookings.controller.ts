import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  availabilityQuerySchema,
  bookingListParamsSchema,
  calendarQuerySchema,
  createBookingSchema,
  updateBookingSchema,
  updateBookingStatusSchema,
  type AvailabilityQueryDto,
  type BookingListParams,
  type CalendarQueryDto,
  type CreateBookingDto,
  type UpdateBookingDto,
  type UpdateBookingStatusDto,
} from './schemas/booking.schemas';
import { BookingsService } from './bookings.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

@ApiTags('bookings')
@ApiBearerAuth()
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get('availability')
  checkAvailability(
    @Query(new ZodValidationPipe(availabilityQuerySchema)) query: AvailabilityQueryDto,
  ) {
    return this.bookingsService.checkAvailability(query);
  }

  @Get('next-number')
  getNextNumber(@Query('date') date: string) {
    return this.bookingsService.getNextNumber(date);
  }

  @Get('calendar')
  getCalendar(
    @Query(new ZodValidationPipe(calendarQuerySchema)) query: CalendarQueryDto,
  ) {
    return this.bookingsService.getCalendar(query);
  }

  @Get()
  findAll(
    @Query(new ZodValidationPipe(bookingListParamsSchema)) params: BookingListParams,
  ) {
    return this.bookingsService.findAll(params);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Post()
  create(
    @Body(new ZodValidationPipe(createBookingSchema)) dto: CreateBookingDto,
  ) {
    return this.bookingsService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateBookingSchema)) dto: UpdateBookingDto,
  ) {
    return this.bookingsService.update(id, dto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateBookingStatusSchema)) dto: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.updateStatus(id, dto);
  }

  @Post(':id/no-show')
  markNoShow(@Param('id') id: string) {
    return this.bookingsService.markNoShow(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookingsService.remove(id);
  }
}
