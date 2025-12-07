import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MarketPriceRecommendationService } from './market-price-recommendation.service';
import { CreateMarketPriceRecommendationDto } from './dto/create-market-price-recommendation.dto';
import { UpdateMarketPriceRecommendationDto } from './dto/update-market-price-recommendation.dto';

@Controller('market-price-recommendation')
export class MarketPriceRecommendationController {
  constructor(
    private readonly marketPriceRecommendationService: MarketPriceRecommendationService,
  ) {}

  @Post()
  create(
    @Body()
    createMarketPriceRecommendationDto: CreateMarketPriceRecommendationDto,
  ) {
    return this.marketPriceRecommendationService.create(
      createMarketPriceRecommendationDto,
    );
  }

  @Get()
  findAll() {
    return this.marketPriceRecommendationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.marketPriceRecommendationService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updateMarketPriceRecommendationDto: UpdateMarketPriceRecommendationDto,
  ) {
    return this.marketPriceRecommendationService.update(
      +id,
      updateMarketPriceRecommendationDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.marketPriceRecommendationService.remove(+id);
  }
}
