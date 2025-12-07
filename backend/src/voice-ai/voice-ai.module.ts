import { Module } from '@nestjs/common';
import { AiVoiceNavigationService } from './voice-ai.service';
import { VoiceAiController } from './voice-ai.controller';
import { KolosalApiService } from './nest_kolosal.service';

@Module({
  controllers: [VoiceAiController],
  providers: [AiVoiceNavigationService, KolosalApiService],
})
export class VoiceAiModule {}
