import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { JwtAccessGuard } from 'src/auth/guards/jwt-access.guard';

@UseGuards(JwtAccessGuard)
@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  // 1. REQUEST QR (TRIGGER GENERATE QR ON-DEMAND)
  @Get('request-qr')
  async requestQr() {
    const result = await this.whatsappService.generateQrOnDemand();
    return {
      success: true,
      ...result,
    };
  }

  // 2. GET QR RAW (SESUDAH DI-GENERATE)
  @Get('qr')
  getQrCode() {
    const qr = this.whatsappService.getQrCode();
    return {
      success: !!qr,
      qr,
      message: qr ? 'QR tersedia.' : 'QR belum tersedia atau sudah login.',
    };
  }

  // 3. GET QR BASE64 (SESUDAH DI-GENERATE)
  @Get('qr-base64')
  async getQrBase64() {
    const base64 = await this.whatsappService.getQrCodeBase64();
    return {
      success: !!base64,
      image: base64,
      message: base64
        ? 'QR Base64 tersedia.'
        : 'QR belum tersedia atau sudah login.',
    };
  }

  // 4. STATUS WA
  @Get('status')
  getStatus() {
    return this.whatsappService.getConnectionStatus();
  }

  // 5. SEND MESSAGE
  @Post('send')
  async sendMessage(
    @Body('number') number: string,
    @Body('message') message: string,
  ) {
    if (!number || !message) {
      return {
        success: false,
        message: 'number dan message wajib diisi.',
      };
    }

    await this.whatsappService.sendMessage(number, message);

    return {
      success: true,
      message: 'Pesan berhasil dikirim.',
    };
  }

  // 6. GET CHATS
  @Get('chats')
  async getChats() {
    return this.whatsappService.getChatList();
  }

  // 7. GET MESSAGES
  @Get('messages')
  async getMessages(@Query('chatId') chatId: string) {
    if (!chatId) {
      return {
        success: false,
        message: 'chatId diperlukan.',
      };
    }

    return this.whatsappService.getMessages(chatId);
  }

  // 8. LOGOUT WA
  @Delete('logout')
  async logout() {
    await this.whatsappService.logout();
    return {
      success: true,
      message: 'Berhasil logout & reset session WA.',
    };
  }
}
