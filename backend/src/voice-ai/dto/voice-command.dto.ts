// file: dto/voice-command.dto.ts

import { IsString, IsNotEmpty } from 'class-validator';

export class VoiceCommandDto {
  @IsString()
  @IsNotEmpty()
  transcript: string;
}

export interface VoiceResponseDto {
  type: 'text' | 'navigate' | 'error';
  data: {
    message?: string; // untuk type text / navigate
    path?: string; // untuk type navigate
    error?: string; // untuk type error
    params?: Record<string, unknown>;
  };
}

export interface NavigationCommandDto {
  path: string;
  message?: string;
  params?: Record<string, unknown>;
  timestamp: number;
}
