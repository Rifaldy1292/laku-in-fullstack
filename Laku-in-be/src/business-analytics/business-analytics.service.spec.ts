import { Test, TestingModule } from '@nestjs/testing';
import { BusinessAnalyticsService } from './business-analytics.service';

describe('BusinessAnalyticsService', () => {
  let service: BusinessAnalyticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BusinessAnalyticsService],
    }).compile();

    service = module.get<BusinessAnalyticsService>(BusinessAnalyticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
