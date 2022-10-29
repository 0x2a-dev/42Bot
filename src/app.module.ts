import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth/auth.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import { BotService } from './bot/bot.service';
import { ProfileService } from './profile/profile.service';

@Module({
  imports: [HttpModule, ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService, AuthService, BotService, ProfileService],
})
export class AppModule {
  constructor(private botService: BotService) {
    this.botService.init();
  }
}
