import { Test, TestingModule } from '@nestjs/testing';
import { AiVoiceNavigationController } from './ai-voice-navigation.controller';
import { AiVoiceNavigationService } from './ai-voice-navigation.service';

describe('AiVoiceNavigationController', () => {
  let controller: AiVoiceNavigationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiVoiceNavigationController],
      providers: [AiVoiceNavigationService],
    }).compile();

    controller = module.get<AiVoiceNavigationController>(
      AiVoiceNavigationController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
