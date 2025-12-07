import { Test, TestingModule } from '@nestjs/testing';
import { VoiceAiController } from './voice-ai.controller';
import { VoiceAiService } from './voice-ai.service';

describe('VoiceAiController', () => {
  let controller: VoiceAiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VoiceAiController],
      providers: [VoiceAiService],
    }).compile();

    controller = module.get<VoiceAiController>(VoiceAiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
