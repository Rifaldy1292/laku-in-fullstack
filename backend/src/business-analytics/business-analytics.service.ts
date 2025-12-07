import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OpenAI } from 'openai';

interface FinancialSummaryParams {
  startDate: string;
  endDate: string;
}
@Injectable()
export class BusinessAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}
  private openaiClient = new OpenAI({
    apiKey: process.env.KOLOSAL_API_KEY,
    baseURL: 'https://api.kolosal.ai/v1',
  });

  /**
   * Generate summary dari database WA
   */
  async generateSummary(params: {
    phone: string;
    maxMessages: number;
    rangeDays: number;
  }) {
    const { phone, maxMessages, rangeDays } = params;

    // Hitung tanggal minimum
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - rangeDays);

    // Ambil chat dari DB
    const chatMessages = await this.prisma.watsapp_message.findMany({
      where: {
        OR: [{ from: phone }, { to: phone }],
        timestamp: { gte: startDate },
      },
      orderBy: { timestamp: 'desc' },
      take: maxMessages,
    });

    if (chatMessages.length === 0) {
      return {
        status: false,
        message: 'Tidak ada pesan dalam periode ini.',
      };
    }

    // Urutkan ascending
    const orderedMessages = chatMessages.reverse();

    // Pecah batch 3000
    const batchSize = 3000;
    const batches: (typeof orderedMessages)[number][][] = [];

    for (
      let position = 0;
      position < orderedMessages.length;
      position += batchSize
    ) {
      const slice = orderedMessages.slice(position, position + batchSize);
      batches.push(slice);
    }

    const summaries: string[] = [];

    // Kirim tiap batch ke AI
    for (const messageBatch of batches) {
      const formattedMessages = messageBatch
        .map((msg) => `[${msg.direction}] ${msg.from}: ${msg.text}`)
        .join('\n');

      const aiResponse = await this.requestSummaryFromAI(formattedMessages);
      summaries.push(aiResponse);
    }

    // Gabungkan semua batch jadi satu summary final
    const finalSummary = await this.requestSummaryFromAI(
      summaries.join('\n\n---SUMMARY PART---\n\n'),
    );

    return {
      status: true,
      messageCount: chatMessages.length,
      batchCount: batches.length,
      summary: finalSummary,
    };
  }

  /**
   * Handler panggilan AI
   */
  async requestSummaryFromAI(textBlock: string) {
    const response = await this.openaiClient.chat.completions.create({
      model: 'Claude Sonnet 4.5',
      messages: [
        {
          role: 'system',
          content: `
Analisis chat WhatsApp ini untuk menilai performa bisnis. 
Hasilkan output JSON dengan dua field:
- summary: string → ringkasan keseluruhan isi chat, fokus pada aktivitas bisnis, pertanyaan pelanggan, keluhan, dan peluang penjualan
- insight: string → penilaian performa bisnis: lancar, stagnan, atau menurun, beserta alasan berdasarkan pola chat

Catatan:
- Jangan menyalin seluruh chat, cukup ringkasan yang mewakili tren dan pola utama
- Gunakan bahasa singkat dan jelas
- Contoh output:
{
  "summary": "Selama periode ini, banyak pertanyaan pelanggan mengenai produk baru, beberapa keluhan pengiriman, dan beberapa permintaan repeat order.",
  "insight": "Bisnis terlihat lancar karena ada banyak interaksi dan peluang penjualan baru, tetapi perlu memperbaiki logistik agar keluhan berkurang."
}
`,
        },
        {
          role: 'user',
          content: textBlock,
        },
      ],
    });

    return response.choices[0].message?.content ?? '-';
  }
  async generateFinancialSummary(params: FinancialSummaryParams) {
    const { startDate, endDate } = params;

    const start = new Date(startDate);
    const end = new Date(endDate);

    // ambil semua transaksi di DB sesuai rentang tanggal
    const transactions = await this.prisma.transactions.findMany({
      where: {
        sale_date: {
          gte: start,
          lte: end,
        },
      },
    });

    let totalSales = 0;
    // parse JSON dari AI
    let summaryFromAi;
    // hitung total income & expense secara manual
    if (transactions) {
      totalSales = transactions.reduce((sum, t) => sum + Number(t.subtotal), 0);

      const response = await this.openaiClient.chat.completions.create({
        model: 'Claude Sonnet 4.5',
        messages: [
          {
            role: 'system',
            content: `
Analisis data transaksi penjualan ini untuk menilai performa bisnis selama rentang waktu tertentu. 
Hasilkan output JSON dengan dua field:
- summary: string → ringkasan keseluruhan transaksi, termasuk tren penjualan, produk populer, dan pola pembelian
- insight: string → penilaian performa bisnis: lancar, stagnan, atau menurun, beserta alasan berdasarkan data transaksi

Catatan:
- Jangan menuliskan semua transaksi satu per satu, cukup ringkasan yang mewakili pola utama
- Gunakan bahasa singkat dan jelas
- Contoh output:
{
  "summary": "Selama periode ini, produk A dan B paling banyak terjual, beberapa transaksi besar terjadi, dan ada tren peningkatan pembelian akhir pekan.",
  "insight": "Bisnis terlihat lancar karena volume penjualan meningkat, tetapi perlu memperhatikan stok produk populer agar tidak habis."
}
`,
          },
          {
            role: 'user',
            content: JSON.stringify(
              transactions.map((t) => ({
                ...t,
                subtotal: Number(t.subtotal),
                unit_price: Number(t.unit_price),
              })),
            ),
          },
        ],
      });
      // ambil konten AI
      const aiContent = response.choices[0].message?.content || '';

      try {
        summaryFromAi = JSON.parse(aiContent); // { summary, insight }
      } catch (err) {
        console.error('Gagal parse JSON AI:', err);
        summaryFromAi = { summary: '', insight: '', full: aiContent };
      }
    }

    return {
      status: true,
      summaryFromAi,
      data: {
        startDate,
        endDate,
        totalSales,
        totalTransactions: transactions.length,
        transactions, // data mentah dikirim ke FE/AI untuk analisis lebih lanjut
      },
    };
  }
}
