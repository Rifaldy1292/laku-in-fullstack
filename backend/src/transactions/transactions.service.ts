import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import OpenAI from 'openai';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}
  private openaiClient = new OpenAI({
    apiKey: process.env.KOLOSAL_API_KEY,
    baseURL: 'https://api.kolosal.ai/v1',
  });

  async create(createTransactionDto: CreateTransactionDto) {
    return this.prisma.transactions.create({
      data: {
        item_name: createTransactionDto.item_name,
        quantity: createTransactionDto.quantity,
        unit_price: createTransactionDto.unit_price,
        subtotal:
          createTransactionDto.unit_price * createTransactionDto.quantity,
        sale_date: createTransactionDto.sale_date,
      },
    });
  }

  async findAll() {
    return this.prisma.transactions.findMany({
      orderBy: { sale_date: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.transactions.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateTransactionDto: UpdateTransactionDto) {
    const updatedData: any = { ...updateTransactionDto };
    if (updateTransactionDto.unit_price && updateTransactionDto.quantity) {
      updatedData.subtotal =
        updateTransactionDto.unit_price * updateTransactionDto.quantity;
    }
    return this.prisma.transactions.update({
      where: { id },
      data: updatedData,
    });
  }

  async remove(id: number) {
    return this.prisma.transactions.delete({
      where: { id },
    });
  }
  async processReceiptWithOpenAI(file: Express.Multer.File) {
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
                text: `You are an AI that reads receipts (invoices) from images.
         Analyze the attached image.

         - If it is a receipt, extract all transaction items and return a JSON array where each item has the keys: 
           "item_name" (string), 
           "quantity" (number), 
           "unit_price" (number), 
           "sale_date" (string, format YYYY-MM-DD). 

         - If a key is missing or not found, use the string "-" as its value.
           Example: [{"item_name": "Apple", "quantity": 2, "unit_price": "-", "sale_date": "2025-12-06"}]

         - If the image is NOT a receipt, return exactly: {"error": "Input bukan nota"}.

         ONLY return valid JSON. Do NOT include any additional text or explanation.`,
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

      let parsedData;

      try {
        parsedData = JSON.parse(aiText);
      } catch {
        parsedData = { error: 'AI response bukan JSON valid' };
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
