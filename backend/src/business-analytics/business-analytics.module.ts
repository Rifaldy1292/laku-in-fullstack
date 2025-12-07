import { Module } from '@nestjs/common';
import { BusinessAnalyticsService } from './business-analytics.service';
import { BusinessAnalyticsController } from './business-analytics.controller';

@Module({
  controllers: [BusinessAnalyticsController],
  providers: [BusinessAnalyticsService],
})
export class BusinessAnalyticsModule {}
