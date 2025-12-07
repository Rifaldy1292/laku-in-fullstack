import { Test, TestingModule } from '@nestjs/testing';
import { MarketPriceRecommendationService } from './market-price-recommendation.service';

describe('MarketPriceRecommendationService', () => {
  let service: MarketPriceRecommendationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MarketPriceRecommendationService],
    }).compile();

    service = module.get<MarketPriceRecommendationService>(
      MarketPriceRecommendationService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
