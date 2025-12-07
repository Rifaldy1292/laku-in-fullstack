import { PartialType } from '@nestjs/mapped-types';
import { CreateMarketPriceRecommendationDto } from './create-market-price-recommendation.dto';

export class UpdateMarketPriceRecommendationDto extends PartialType(
  CreateMarketPriceRecommendationDto,
) {}
