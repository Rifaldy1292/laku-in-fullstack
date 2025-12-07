import { PartialType } from '@nestjs/mapped-types';
import { CreateAiVoiceNavigationDto } from './create-ai-voice-navigation.dto';

export class UpdateAiVoiceNavigationDto extends PartialType(
  CreateAiVoiceNavigationDto,
) {}
