import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('ai')
@UseGuards(AuthGuard('jwt'))
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('classify')
  async classifyMeal(@Body() body: { base64Image: string; mimeType: string }) {
    return this.aiService.classifyMeal(body.base64Image, body.mimeType);
  }

  @Post('chat')
  async chatCoach(@Body() body: { messages: any[] }) {
    return this.aiService.chatCoach(body.messages);
  }
}
