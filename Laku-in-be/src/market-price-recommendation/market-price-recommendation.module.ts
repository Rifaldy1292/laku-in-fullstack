import { Module } from '@nestjs/common';
import { MarketPriceRecommendationService } from './market-price-recommendation.service';
import { MarketPriceRecommendationController } from './market-price-recommendation.controller';

@Module({
  controllers: [MarketPriceRecommendationController],
  providers: [MarketPriceRecommendationService],
})
export class MarketPriceRecommendationModule {}
