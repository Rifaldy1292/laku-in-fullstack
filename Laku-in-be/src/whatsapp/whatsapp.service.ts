import { HttpException, Injectable, OnModuleInit } from '@nestjs/common';
import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';

import * as QRCode from 'qrcode';
import * as fs from 'fs';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WhatsappService implements OnModuleInit {
  private client;
  private isConnected = false;
  private currentQrCode: string | null = null;
  private currentQrTimestamp: number | null = null;
  private readonly prisma: PrismaService;

  private async saveMessage(payload: {
    id?: string;
    from: string;
    to: string;
    text: string | null;
    timestamp?: Date;
    direction: 'in' | 'out';
    raw?: any;
  }) {
    try {
      await this.prisma.watsapp_message.create({
        data: {
          id: payload.id ?? `auto-${Date.now()}`, // jika outgoing tidak punya ID WA
          from: payload.from,
          to: payload.to,
          text: payload.text,
          direction: payload.direction,
          timestamp: payload.timestamp ?? new Date(),
          rawJson: payload.raw ?? null,
        },
      });
    } catch (err) {
      console.log('[DB] Gagal menyimpan pesan:', err.message);
    }
  }

  async onModuleInit() {
    console.log('WhatsApp Service ready (idle, no QR generated).');
  }

  async initializeWhatsApp() {
    if (this.client) return;

    const { version } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState('./wa-auth');

    this.client = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      browser: ['Baileys', 'Chrome', '4.0.0'],
    });

    console.log('[WA] Socket created, setting up events...');

    // Simpan sesi
    this.client.ev.on('creds.update', saveCreds);

    // Status koneksi
    this.client.ev.on('connection.update', ({ connection }) => {
      if (connection === 'connecting') {
        console.log('[WA] Connecting to WhatsApp...');
      }

      if (connection === 'open') {
        this.isConnected = true;
        this.currentQrCode = null;
        console.log('[WA] Connected successfully!');
      }

      if (connection === 'close') {
        this.isConnected = false;
        this.client = null;
        console.log('[WA] Connection closed.');
      }
    });

    // PESAN MASUK
    this.client.ev.on('messages.upsert', async (msg) => {
      const message = msg.messages[0];
      const from = message.key.remoteJid;

      if (message.key.fromMe) return;

      const text =
        message.message?.conversation ||
        message.message?.extendedTextMessage?.text ||
        '';
      await this.saveMessage({
        id: message.key.id,
        from: message.key.remoteJid,
        to: this.client?.user?.id || 'unknown',
        text,
        timestamp: new Date(message.messageTimestamp * 1000),
        direction: 'in',
        raw: message,
      });

      console.log('[WA] Pesan masuk:', from, text);

      //logic ai disini
      const replyText =
        'Halo! Pesan kamu sudah diterima, mohon tunggu sebentar ya 😊';

      await this.client.sendMessage(from, { text: replyText });

      // ===== 3. SIMPAN PESAN KELUAR (OUTGOING) =====
      await this.saveMessage({
        from: this.client?.user?.id || 'unknown',
        to: from,
        text: replyText,
        direction: 'out',
      });
    });

    console.log('[WA] All event listeners registered.');
  }

  async generateQrOnDemand(): Promise<{
    qr?: string;
    message?: string;
    generatedAt?: string;
  }> {
    // FIX UTAMA → kalau koneksi closed, hidupkan ulang socket
    if (!this.client) {
      console.log('[WA] Socket closed, initializing new WhatsApp socket...');
      await this.initializeWhatsApp();
    }

    // nanti cek apakah  status koneksi close , jika close maka aktifkan dulu
    // Jika sudah connect, tidak perlu QR
    if (this.isConnected) {
      return { message: 'Sudah terhubung, tidak perlu QR.' };
    }

    // Gunakan QR lama jika masih valid (< 60 detik)
    if (this.currentQrCode && this.currentQrTimestamp) {
      const age = Date.now() - this.currentQrTimestamp;
      const EXPIRE_MS = 60000; // 60 detik

      if (age < EXPIRE_MS) {
        return {
          qr: this.currentQrCode,
          generatedAt: `${Math.floor((Date.now() - this.currentQrTimestamp) / 1000)}s`,
        };
      }
    }

    // Jika QR lama expired → tunggu QR baru
    return new Promise((resolve) => {
      const handler = (update) => {
        const { qr, connection } = update;

        // QR baru diterima
        if (qr) {
          this.currentQrCode = qr;
          this.currentQrTimestamp = Date.now();
          this.client.ev.off('connection.update', handler);

          return resolve({
            qr,
            generatedAt: `${Math.floor((Date.now() - this.currentQrTimestamp) / 1000)}s`,
          });
        }

        // Sudah connect
        if (connection === 'open') {
          this.isConnected = true;
          this.client.ev.off('connection.update', handler);
          return resolve({ message: 'Sudah terhubung, tidak perlu QR.' });
        }
      };

      this.client.ev.on('connection.update', handler);
    });
  }

  // ========== KIRIM PESAN ========== //
  async sendMessage(jid: string, text: string) {
    if (!this.client || !this.isConnected) {
      throw new HttpException('WhatsApp belum terhubung.', 503);
    }

    try {
      await this.client.sendMessage(jid, { text });

      return {
        success: true,
        message: 'Pesan berhasil dikirim',
      };
    } catch (err) {
      throw new HttpException('Gagal mengirim pesan: ' + err.message, 400);
    }
  }

  // ========== GET QR RAW ========== //
  getQrCode() {
    return {
      qr: this.currentQrCode,
      generatedAt: this.currentQrTimestamp
        ? `${Math.floor((Date.now() - this.currentQrTimestamp) / 1000)}s`
        : '',
    };
  }

  // ========== GET QR BASE64 ========== //
  async getQrCodeBase64() {
    if (!this.currentQrCode) return null;
    return QRCode.toDataURL(this.currentQrCode);
  }

  // ========== CEK STATUS ========== //
  getConnectionStatus() {
    return {
      connected: this.isConnected,
    };
  }

  // ========== LOGOUT WA ========== //
  async logout() {
    try {
      await this.client?.logout();
    } catch (err) {
      console.log('[WA] Logout error ignored:', err.message);
    }

    if (fs.existsSync('./wa-auth')) {
      fs.rmSync('./wa-auth', { recursive: true, force: true });
    }

    this.isConnected = false;
    this.currentQrCode = null;
    this.client = null;

    console.log('[WA] Session cleared.');
  }

  // ========== LIST CHAT ========== //
  async getChatList() {
    try {
      const chats = await this.client?.store?.chats?.all();
      if (!chats) return [];
      return chats.map((c) => ({
        id: c.id,
        name: c.name,
      }));
    } catch {
      return [];
    }
  }

  // ========== LIST MESSAGES ========== //
  async getMessages(chatId: string) {
    try {
      const chat = this.client?.store?.messages[chatId];
      if (!chat) return [];

      return chat.map((msg) => ({
        id: msg.key.id,
        from: msg.key.remoteJid,
        me: msg.key.fromMe,
        text:
          msg.message?.conversation ||
          msg.message?.extendedTextMessage?.text ||
          null,
        timestamp: msg.messageTimestamp,
      }));
    } catch {
      return [];
    }
  }
}
