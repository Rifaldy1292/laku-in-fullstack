import { Injectable, Logger } from '@nestjs/common';
import {
  KolosalApiService,
  KolosalCompletionResponse,
} from './nest_kolosal.service';
import { VoiceResponseDto } from './dto/voice-command.dto';

export const NAVIGATION_SYSTEM_PROMPT = `Anda adalah AI assistant yang dapat membantu navigasi aplikasi bernama "Laku-in".

TUGAS UTAMA:
Analisis perintah pengguna dan tentukan apakah ingin:
1. NAVIGASI ke halaman tertentu
2. BERDIALOG (menerima pesan teks biasa)

DAFTAR HALAMAN YANG TERSEDIA:
• Beranda: "/" - Halaman utama aplikasi
• Login: "/auth" - Halaman autentikasi
• Dashboard: "/dashboard" - Dashboard utama
• Laporan Keuangan: "/dashboard/financial-report"
• Analitik Bisnis: "/dashboard/business-analytics" 
• Unggah Nota: "/dashboard/receipt-upload"
• Pembuat Poster: "/dashboard/poster-generator"

PERILAKU NAVIGASI:
- Jika user ingin ke dashboard mana pun (keuangan, analitik, nota, poster), arahkan ke "/dashboard"
- Untuk halaman spesifik gunakan path lengkap
- User butuh login untuk halaman selain "/" dan "/auth"

FORMAT RESPONSE HARUS JSON:
{
  "action": "navigation" | "text",
  "response": {
    "message": "pesan untuk user", // wajib untuk text, optional untuk navigation
    "path": "/path/halaman", // wajib untuk navigation
    "params": {}, // optional parameters
    "timestamp": 1701234567890
  }
}

CONTOH PERINTAH & RESPONSE:
- "buka laporan keuangan" → {"action":"navigation","response":{"path":"/dashboard/financial-report","timestamp":123}}
- "aku ingin lihat analitik" → {"action":"navigation","response":{"path":"/dashboard/business-analytics","timestamp":123}}
- "halo" → {"action":"text","response":{"message":"Halo! Ada yang bisa saya bantu?","timestamp":123}}
- "masuk ke halaman utama" → {"action":"navigation","response":{"path":"/","timestamp":123}}

Jika tidak yakin, berikan response text dengan saran halaman yang tersedia.`;

@Injectable()
export class AiVoiceNavigationService {
  private readonly logger = new Logger(AiVoiceNavigationService.name);

  constructor(private readonly kolosalApiService: KolosalApiService) {}

  async processVoiceCommand(transcript: string): Promise<VoiceResponseDto> {
    try {
      this.logger.log(`🎤 Mengirim voice message: ${transcript}`);

      const trimmedTranscript = transcript.trim();

      if (!trimmedTranscript || trimmedTranscript.length === 0) {
        return {
          type: 'error',
          data: { error: 'Transcript kosong terdeteksi' },
        };
      }

      this.logger.log(`📝 Processing cleaned transcript: ${trimmedTranscript}`);
      this.logger.log('🤖 Sending to AI for processing...');

      return await this.processWithAI(trimmedTranscript);
    } catch (error) {
      this.logger.error('❌ Error in processVoiceCommand:', error);
      return {
        type: 'error',
        data: { error: 'Error memproses transkripsi' },
      };
    }
  }

  private async processWithAI(transcript: string): Promise<VoiceResponseDto> {
    try {
      const completionRequest = {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system' as const,
            content: NAVIGATION_SYSTEM_PROMPT,
          },
          {
            role: 'user' as const,
            content: transcript,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
        stream: false,
      };

      const completionResponse: KolosalCompletionResponse =
        await this.kolosalApiService.sendCompletion(completionRequest);

      if (
        !completionResponse.success ||
        !completionResponse.data?.choices?.[0]?.message
      ) {
        return {
          type: 'error',
          data: { error: 'Response dari Kolosal AI tidak valid' },
        };
      }

      const aiMessage =
        completionResponse.data.choices[0].message.content.trim();

      if (!aiMessage) {
        return {
          type: 'error',
          data: { error: 'Tidak ada teks yang diterima dari AI' },
        };
      }

      this.logger.log(`🤖 AI Response: ${aiMessage}`);

      return this.parseNavigationResponse(aiMessage);
    } catch (error) {
      this.logger.error('❌ Error processing with AI:', error);
      throw error;
    }
  }

  private parseNavigationResponse(content: string): VoiceResponseDto {
    try {
      if (typeof content !== 'string' || content.trim().length === 0) {
        throw new Error('Content tidak valid');
      }

      const cleanedContent = content.trim();
      let parsed: unknown;

      try {
        parsed = JSON.parse(cleanedContent);
      } catch (parseError) {
        this.logger.log('JSON parse error, using text fallback');
        return this.extractNavigationFromText(cleanedContent);
      }

      if (
        parsed &&
        typeof parsed === 'object' &&
        'action' in parsed &&
        'response' in parsed
      ) {
        const obj = parsed as Record<string, unknown>;

        if (obj.action !== 'text' && obj.action !== 'navigation') {
          return this.extractNavigationFromText(cleanedContent);
        }

        if (!obj.response || typeof obj.response !== 'object') {
          return this.extractNavigationFromText(cleanedContent);
        }

        const action = obj.action;
        const response = obj.response as Record<string, unknown>;

        if (action === 'navigation' && typeof response.path === 'string') {
          return {
            type: 'navigate',
            data: {
              path: response.path,
              message:
                typeof response.message === 'string'
                  ? response.message
                  : undefined,
            },
          };
        } else if (action === 'text' && typeof response.message === 'string') {
          return {
            type: 'text',
            data: { message: response.message },
          };
        }
      }

      return this.extractNavigationFromText(cleanedContent);
    } catch (error) {
      this.logger.warn('Failed to parse response, using text fallback:', error);

      return {
        type: 'text',
        data: { message: content.trim() },
      };
    }
  }

  private extractNavigationFromText(text: string): VoiceResponseDto {
    try {
      if (
        text.toLowerCase().includes('navigation') ||
        text.toLowerCase().includes('navigasi') ||
        text.includes('"action": "navigation"')
      ) {
        const pathMatch = text.match(/"path":\s*"([^"]+)"/);

        if (pathMatch && pathMatch[1]) {
          const messageMatch = text.match(/"message":\s*"([^"]*)"/);

          return {
            type: 'navigate',
            data: {
              path: pathMatch[1],
              message: messageMatch ? messageMatch[1] : undefined,
            },
          };
        }
      }

      const cleanedMessage = text.trim();
      if (cleanedMessage.length === 0) {
        return {
          type: 'text',
          data: { message: 'Respon kosong' },
        };
      }

      return {
        type: 'text',
        data: { message: cleanedMessage },
      };
    } catch (error) {
      this.logger.error('Fallback navigation parse failed:', error);

      return {
        type: 'text',
        data: { message: 'Maaf, terjadi kesalahan saat memproses perintah.' },
      };
    }
  }

  async initialize(): Promise<boolean> {
    try {
      this.logger.log('🎤 Inisialisasi Voice Service...');
      return true;
    } catch (error) {
      this.logger.error('❌ Failed to initialize voice service:', error);
      return false;
    }
  }
}
