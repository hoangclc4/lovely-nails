import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SessionPhotosService } from './session-photos.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  createSessionPhotoSchema,
  sessionPhotoListParamsSchema,
  portfolioParamsSchema,
  type CreateSessionPhotoDto,
  type SessionPhotoListParams,
  type PortfolioParams,
} from './schemas/session-photo.schemas';

@ApiTags('session-photos')
@ApiBearerAuth()
@Controller('')
export class SessionPhotosController {
  constructor(private readonly sessionPhotosService: SessionPhotosService) {}

  @Post('sessions/:sessionId/photos')
  addPhoto(
    @Param('sessionId') sessionId: string,
    @Body(new ZodValidationPipe(createSessionPhotoSchema)) dto: CreateSessionPhotoDto,
  ) {
    return this.sessionPhotosService.addPhoto(sessionId, dto);
  }

  @Get('sessions/:sessionId/photos')
  getSessionPhotos(@Param('sessionId') sessionId: string) {
    return this.sessionPhotosService.getSessionPhotos(sessionId);
  }

  @Delete('sessions/:sessionId/photos/:photoId')
  @HttpCode(204)
  deletePhoto(
    @Param('sessionId') sessionId: string,
    @Param('photoId') photoId: string,
  ) {
    return this.sessionPhotosService.deletePhoto(sessionId, photoId);
  }

  @Get('customers/:customerId/photos')
  getCustomerPhotos(
    @Param('customerId') customerId: string,
    @Query(new ZodValidationPipe(sessionPhotoListParamsSchema)) params: SessionPhotoListParams,
  ) {
    return this.sessionPhotosService.getCustomerPhotos(customerId, params);
  }

  @Get('employees/:employeeId/portfolio')
  getEmployeePortfolio(
    @Param('employeeId') employeeId: string,
    @Query(new ZodValidationPipe(portfolioParamsSchema)) params: PortfolioParams,
  ) {
    return this.sessionPhotosService.getEmployeePortfolio(employeeId, params);
  }
}
