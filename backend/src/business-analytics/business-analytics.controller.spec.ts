import { Test, TestingModule } from '@nestjs/testing';
import { BusinessAnalyticsController } from './business-analytics.controller';
import { BusinessAnalyticsService } from './business-analytics.service';

describe('BusinessAnalyticsController', () => {
  let controller: BusinessAnalyticsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusinessAnalyticsController],
      providers: [BusinessAnalyticsService],
    }).compile();

    controller = module.get<BusinessAnalyticsController>(
      BusinessAnalyticsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
