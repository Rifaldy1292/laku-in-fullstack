import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ChatBotService } from './chat-bot.service';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('chat-bot')
export class ChatBotController {
  constructor(private readonly chatBotService: ChatBotService) {}

  @Post('message')
  async sendMessage(@Body() sendMessageDto: SendMessageDto) {
    if (!sendMessageDto?.message) {
      throw new BadRequestException('Message tidak boleh kosong');
    }

    return this.chatBotService.sendMessage(sendMessageDto);
  }
}
