import { Injectable, BadRequestException } from '@nestjs/common';
import OpenAI from 'openai';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatBotService {
  private openaiClient = new OpenAI({
    apiKey: process.env.KOLOSAL_API_KEY,
    baseURL: process.env.KOLOSAL_URL,
  });

  async sendMessage(sendMessageDto: SendMessageDto) {
    const { message } = sendMessageDto;

    if (!message) {
      throw new BadRequestException('Message tidak boleh kosong');
    }

    try {
      const response = await this.openaiClient.chat.completions.create({
        model: 'GLM 4.6',
        messages: [
          {
            role: 'user',
            content: `
Kamu adalah AI analis bisnis. 
Berdasarkan data/chat berikut, berikan analisis singkat mengenai performa bisnis:
- Ringkas aktivitas bisnis, pertanyaan pelanggan, keluhan, dan peluang penjualan
- Berikan insight apakah bisnis lancar, stagnan, atau menurun, beserta alasannya

Data untuk dianalisis:
${message}

Jawaban gunakan bahasa manusia biasa, tidak perlu format JSON, cukup teks yang mudah dibaca.
      `,
          },
        ],
      });

      const aiText = response?.choices?.[0]?.message?.content ?? '';
      return { text: aiText };
    } catch (err: any) {
      console.error('OpenAI API error:', err?.message || err);
      throw new BadRequestException('Gagal memproses chat AI');
    }
  }
}
