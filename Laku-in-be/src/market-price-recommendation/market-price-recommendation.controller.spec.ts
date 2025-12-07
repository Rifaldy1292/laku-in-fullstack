import { Test, TestingModule } from '@nestjs/testing';
import { MarketPriceRecommendationController } from './market-price-recommendation.controller';
import { MarketPriceRecommendationService } from './market-price-recommendation.service';

describe('MarketPriceRecommendationController', () => {
  let controller: MarketPriceRecommendationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarketPriceRecommendationController],
      providers: [MarketPriceRecommendationService],
    }).compile();

    controller = module.get<MarketPriceRecommendationController>(
      MarketPriceRecommendationController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
