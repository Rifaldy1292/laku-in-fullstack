import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { BusinessAnalyticsModule } from './business-analytics/business-analytics.module';
import { FinancialRecordModule } from './financial-record/financial-record.module';
import { ProductMediaEditorModule } from './product-media-editor/product-media-editor.module';
import { MarketPriceRecommendationModule } from './market-price-recommendation/market-price-recommendation.module';
import { AiVoiceNavigationModule } from './ai-voice-navigation/ai-voice-navigation.module';
import { TransactionsModule } from './transactions/transactions.module';
import { ProductsModule } from './products/products.module';
import { ChatBotModule } from './chat-bot/chat-bot.module';
import { VoiceAiModule } from './voice-ai/voice-ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    PrismaModule,
    WhatsappModule,
    BusinessAnalyticsModule,
    FinancialRecordModule,
    ProductMediaEditorModule,
    MarketPriceRecommendationModule,
    AiVoiceNavigationModule,
    TransactionsModule,
    ProductsModule,
    ChatBotModule,
    VoiceAiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
