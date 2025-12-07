import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AiVoiceNavigationService } from './voice-ai.service';
import { VoiceCommandDto, VoiceResponseDto } from './dto/voice-command.dto';

@ApiTags('AI Voice Navigation')
@Controller('ai-voice-navigation')
export class VoiceAiController {
  constructor(
    private readonly aiVoiceNavigationService: AiVoiceNavigationService,
  ) {}

  @Post('process')
  async processVoiceCommand(
    @Body() voiceCommandDto: VoiceCommandDto,
  ): Promise<VoiceResponseDto> {
    return this.aiVoiceNavigationService.processVoiceCommand(
      voiceCommandDto.transcript,
    );
  }

  @Get('health')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check voice service health' })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
  })
  async checkHealth(): Promise<{ status: string; initialized: boolean }> {
    const initialized = await this.aiVoiceNavigationService.initialize();
    return {
      status: initialized ? 'healthy' : 'unhealthy',
      initialized,
    };
  }
}
