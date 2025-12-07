import { Module } from '@nestjs/common';
import { AiVoiceNavigationService } from './ai-voice-navigation.service';
import { AiVoiceNavigationController } from './ai-voice-navigation.controller';

@Module({
  controllers: [AiVoiceNavigationController],
  providers: [AiVoiceNavigationService],
})
export class AiVoiceNavigationModule {}
