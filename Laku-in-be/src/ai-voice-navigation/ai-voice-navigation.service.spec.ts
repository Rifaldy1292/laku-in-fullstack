import { Test, TestingModule } from '@nestjs/testing';
import { AiVoiceNavigationService } from './ai-voice-navigation.service';

describe('AiVoiceNavigationService', () => {
  let service: AiVoiceNavigationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiVoiceNavigationService],
    }).compile();

    service = module.get<AiVoiceNavigationService>(AiVoiceNavigationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
