import { Injectable } from '@nestjs/common';
import { CreateMarketPriceRecommendationDto } from './dto/create-market-price-recommendation.dto';
import { UpdateMarketPriceRecommendationDto } from './dto/update-market-price-recommendation.dto';

@Injectable()
export class MarketPriceRecommendationService {
  create(
    createMarketPriceRecommendationDto: CreateMarketPriceRecommendationDto,
  ) {
    return 'This action adds a new marketPriceRecommendation';
  }

  findAll() {
    return `This action returns all marketPriceRecommendation`;
  }

  findOne(id: number) {
    return `This action returns a #${id} marketPriceRecommendation`;
  }

  update(
    id: number,
    updateMarketPriceRecommendationDto: UpdateMarketPriceRecommendationDto,
  ) {
    return `This action updates a #${id} marketPriceRecommendation`;
  }

  remove(id: number) {
    return `This action removes a #${id} marketPriceRecommendation`;
  }
}
