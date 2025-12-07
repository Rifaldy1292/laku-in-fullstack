import { Test, TestingModule } from '@nestjs/testing';
import { VoiceAiService } from './voice-ai.service';

describe('VoiceAiService', () => {
  let service: VoiceAiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VoiceAiService],
    }).compile();

    service = module.get<VoiceAiService>(VoiceAiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
