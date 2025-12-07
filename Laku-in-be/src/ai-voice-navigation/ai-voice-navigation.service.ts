import { Injectable } from '@nestjs/common';
import { CreateAiVoiceNavigationDto } from './dto/create-ai-voice-navigation.dto';
import { UpdateAiVoiceNavigationDto } from './dto/update-ai-voice-navigation.dto';

@Injectable()
export class AiVoiceNavigationService {
  create(createAiVoiceNavigationDto: CreateAiVoiceNavigationDto) {
    return 'This action adds a new aiVoiceNavigation';
  }

  findAll() {
    return `This action returns all aiVoiceNavigation`;
  }

  findOne(id: number) {
    return `This action returns a #${id} aiVoiceNavigation`;
  }

  update(id: number, updateAiVoiceNavigationDto: UpdateAiVoiceNavigationDto) {
    return `This action updates a #${id} aiVoiceNavigation`;
  }

  remove(id: number) {
    return `This action removes a #${id} aiVoiceNavigation`;
  }
}
