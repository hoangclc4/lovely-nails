import { Module } from '@nestjs/common';
import { SessionPhotosService } from './session-photos.service';
import { SessionPhotosController } from './session-photos.controller';

@Module({
  controllers: [SessionPhotosController],
  providers: [SessionPhotosService],
})
export class SessionPhotosModule {}
