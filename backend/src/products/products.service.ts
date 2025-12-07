import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import OpenAI from 'openai';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}
  private openaiClient = new OpenAI({
    apiKey: process.env.KOLOSAL_API_KEY,
    baseURL: 'https://api.kolosal.ai/v1',
  });
  async create(createProductDto: CreateProductDto) {
    return await this.prisma.product.create({
      data: createProductDto,
    });
  }

  async findAll() {
    return await this.prisma.product.findMany();
  }

  async findOne(id: number) {
    return await this.prisma.product.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    return await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async remove(id: number) {
    return await this.prisma.product.delete({
      where: { id },
    });
  }
  async processStockWithOpenAI(file: Express.Multer.File) {
    if (!file) {
      // Tangani file kosong
      throw new BadRequestException('File harus diunggah');
    }
    // Convert buffer ke base64 untuk dikirim ke OpenAI
    const base64Image = `data:image/png;base64,${file.buffer.toString('base64')}`;

    try {
      const response = await this.openaiClient.chat.completions.create({
        model: 'Qwen 3 30BA3B',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `
You are an AI that analyzes product images for stock counting.
Analyze the attached image.

- Extract each product visible in the image.
- Return a JSON array where each item has keys:
  "name" (string) → product name,
  "stock" (number) → jumlah produk terdeteksi,
  "price" (number) → harga perkiraan produk, guess if unknown.
- If no products are found, return an empty array: [].
- ONLY return valid JSON. Do NOT include any additional text or explanation.
Example: [{"name": "Apple", "stock": 2, "price": 15000}]
            `,
              },
              { type: 'image_url', image_url: { url: base64Image } },
            ],
          },
        ],
      });

      // Pastikan choices dan message ada
      const aiText =
        response?.choices?.[0]?.message?.content ??
        'AI tidak mengembalikan hasil.';

      let parsedData: CreateProductDto[] | { error: string } = [];
      try {
        parsedData = JSON.parse(aiText) as CreateProductDto[];
      } catch {
        parsedData = { error: 'AI response bukan JSON valid sesuai DTO' };
      }
      return { text: aiText, data: parsedData };
    } catch (err: any) {
      console.error('OpenAI API error:', err?.message || err);
      // Bisa kembalikan info error ke FE
      throw new BadRequestException(
        err?.response?.data?.error?.message || 'Gagal memproses gambar.',
      );
    }
  }
}
