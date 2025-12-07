import { Injectable, BadRequestException } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class ProductMediaEditorService {
  private openaiClient = new OpenAI({
    apiKey: process.env.KOLOSAL_API_KEY, // atau OPENAI_API_KEY sesuai konfigurasi
    baseURL: 'https://api.kolosal.ai/v1',
  });

  async editImageToPoster(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File harus diunggah');
    }

    // Convert buffer ke base64 untuk dikirim ke AI
    const base64Image = `data:image/png;base64,${file.buffer.toString('base64')}`;

    try {
      const response = await this.openaiClient.chat.completions.create({
        model: 'Claude Sonnet 4.5', // atau model AI lain yang mendukung image input
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `
Kamu adalah AI editor gambar. Ubah gambar yang diunggah menjadi poster estetik siap jual:
- Pertahankan kualitas produk
- Tambahkan elemen visual menarik (background, teks promosi, estetika)
- Jangan ubah konten produk secara salah
- Hasilkan output dalam format URL atau base64 image
`,
              },
              { type: 'image_url', image_url: { url: base64Image } },
            ],
          },
        ],
      });

      const aiText =
        response?.choices?.[0]?.message?.content ??
        'AI tidak mengembalikan hasil.';

      return { text: aiText }; // Bisa berupa URL/base64 poster dari AI
    } catch (err: any) {
      console.error('OpenAI API error:', err?.message || err);
      throw new BadRequestException(
        err?.response?.data?.error?.message || 'Gagal memproses gambar.',
      );
    }
  }
}
