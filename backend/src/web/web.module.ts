import { Module } from '@nestjs/common';
import { WebService } from './web.service.js';

@Module({
  providers: [WebService],
  exports: [WebService],
})
export class WebModule {}
