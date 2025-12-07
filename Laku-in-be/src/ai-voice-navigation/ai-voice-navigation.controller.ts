import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AiVoiceNavigationService } from './ai-voice-navigation.service';
import { CreateAiVoiceNavigationDto } from './dto/create-ai-voice-navigation.dto';
import { UpdateAiVoiceNavigationDto } from './dto/update-ai-voice-navigation.dto';

@Controller('ai-voice-navigation')
export class AiVoiceNavigationController {
  constructor(
    private readonly aiVoiceNavigationService: AiVoiceNavigationService,
  ) {}

  @Post()
  create(@Body() createAiVoiceNavigationDto: CreateAiVoiceNavigationDto) {
    return this.aiVoiceNavigationService.create(createAiVoiceNavigationDto);
  }

  @Get()
  findAll() {
    return this.aiVoiceNavigationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.aiVoiceNavigationService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAiVoiceNavigationDto: UpdateAiVoiceNavigationDto,
  ) {
    return this.aiVoiceNavigationService.update(
      +id,
      updateAiVoiceNavigationDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.aiVoiceNavigationService.remove(+id);
  }
}
