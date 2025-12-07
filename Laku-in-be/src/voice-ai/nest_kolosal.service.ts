import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosError } from 'axios';

export interface KolosalCompletionRequest {
  model?: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
}

export interface KolosalCompletionResponse {
  success: boolean;
  data?: {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
      index: number;
      message: {
        role: string;
        content: string;
      };
      finish_reason: string;
    }>;
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
  error?: string;
}

@Injectable()
export class KolosalApiService {
  private readonly logger = new Logger(KolosalApiService.name);
  private readonly REQUEST_TIMEOUT = 30000; // 30 seconds
  private axiosInstance: AxiosInstance;

  constructor(private configService: ConfigService) {
    const apiKey = process.env.KOLOSAL_API_KEY;
    const apiUrl = process.env.KOLOSAL_URL;

    this.axiosInstance = axios.create({
      baseURL: apiUrl,
      timeout: this.REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'X-Client-Version': '1.0.0',
      },
    });
  }

  private getApiKey(): string {
    const apiKey = this.configService.get<string>('KOLOSAL_API_KEY');

    if (!apiKey) {
      throw new HttpException(
        'Kolosal API Key tidak ditemukan. Pastikan KOLOSAL_API_KEY sudah diatur di environment variables',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!this.isValidApiKey(apiKey)) {
      throw new HttpException(
        'Format Kolosal API Key tidak valid. Pastikan menggunakan API key yang benar.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return apiKey;
  }

  private isValidApiKey(apiKey: string): boolean {
    if (typeof apiKey !== 'string') return false;
    if (apiKey.length < 10) return false;

    const patterns = [
      /^[a-zA-Z0-9]{32,}$/, // Most common format
      /^sk-[a-zA-Z0-9]{48,}$/, // OpenAI-like format
      /^kl-[a-zA-Z0-9]{48,}$/, // Kolosal-like format
    ];

    return patterns.some((pattern) => pattern.test(apiKey));
  }

  private getApiUrl(): string {
    const url =
      this.configService.get<string>('KOLOSAL_API_URL') ||
      'https://api.kolosal.dev/v1/completions';

    try {
      new URL(url);

      if (!url.includes('/v1/')) {
        this.logger.warn('API URL should include /v1/ path for Kolosal API');
      }

      return url;
    } catch (error) {
      throw new HttpException(
        `Invalid API URL format: ${url}. Pastikan URL diawali dengan http:// atau https://`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async sendCompletion(
    request: KolosalCompletionRequest,
  ): Promise<KolosalCompletionResponse> {
    try {
      this.logger.log('Sending completion request to Kolosal API');

      const response = await this.axiosInstance.post<KolosalCompletionResponse>(
        '',
        request,
      );

      if (!response.data.success) {
        throw new HttpException(
          response.data.error || 'Kolosal API mengembalikan error',
          HttpStatus.BAD_REQUEST,
        );
      }

      return response.data;
    } catch (error) {
      this.logger.error('Kolosal API error:', error);

      if (axios.isAxiosError(error)) {
        return this.handleAxiosError(error);
      }

      throw new HttpException(
        'Terjadi kesalahan saat berkomunikasi dengan Kolosal API',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private handleAxiosError(error: AxiosError): never {
    if (error.code === 'ECONNABORTED') {
      throw new HttpException(
        'Request timeout. Silakan coba lagi.',
        HttpStatus.REQUEST_TIMEOUT,
      );
    }

    if (
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('ENOTFOUND')
    ) {
      throw new HttpException(
        'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;

      const errorMessage = data?.error || data?.message || error.message;

      if (status === 401) {
        throw new HttpException(
          'API Key tidak valid atau kadaluarsa. Periksa konfigurasi API key Anda.',
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (status === 429) {
        throw new HttpException(
          'Permintaan terlalu cepat. Silakan tunggu sebentar dan coba lagi.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      if (status === 404) {
        throw new HttpException(
          'Model yang diminta tidak tersedia. Gunakan model yang valid.',
          HttpStatus.NOT_FOUND,
        );
      }

      if (status === 400) {
        throw new HttpException(
          'Permintaan tidak valid. Periksa format data yang dikirim.',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (status >= 500) {
        throw new HttpException(
          'Terjadi kesalahan di server. Silakan coba lagi nanti.',
          HttpStatus.BAD_GATEWAY,
        );
      }

      throw new HttpException(`Kolosal API error: ${errorMessage}`, status);
    }

    throw new HttpException(
      'Permintaan jaringan gagal. Periksa koneksi internet Anda.',
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}
