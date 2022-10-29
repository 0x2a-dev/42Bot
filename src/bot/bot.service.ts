import { Injectable } from '@nestjs/common';
import { create } from '@open-wa/wa-automate';
import { ConfigService } from '@nestjs/config';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import {
  TokenResponse,
  UserAPIResponse,
} from 'src/interfaces/ft-api.interface';

@Injectable()
export class BotService {
  private whatsapp: any;

  constructor(
    private configService: ConfigService,
    private authService: AuthService,
    private userService: UserService,
  ) {}

  async init() {
    create({
      sessionId: '42BOT',
      multiDevice: true, //required to enable multiDevice support
      authTimeout: 60, //wait only 60 seconds to get a connection with the host account device
      blockCrashLogs: true,
      disableSpins: true,
      headless: true,
      logConsole: false,
      popup: true,
      qrTimeout: 0, //0 means it will wait forever for you to scan the qr code
    })
      .then((client) => {
        this.whatsapp = client;
        this.start();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  start() {
    this.whatsapp.onMessage(async (message) => {
      /**
       * GREETINGS => Ask for login if not logged in
       */
      if (message.body === 'Hi') {
        const user = await this.userService.userByWhatsappFrom(message.from);
        if (user) {
          this.whatsapp.sendText(
            message.from,
            `Welcome back ${user.full_name}!`,
          );
        } else {
          await this.sendTextMessage(
            message.from,
            `Hello!
            Please click on the link below to login to 42 API (you will be redirected afterwords to the chatbot so you can send us the code):
            https://api.intra.42.fr/oauth/authorize?client_id=${this.configService.get(
              'CID',
            )}&redirect_uri=${this.configService.get(
              'REDIRECT_URI',
            )}&response_type=code&scope=${this.configService.get('SCOPE')}`,
          );
        }
      } else if (message.body.includes('tk:')) {
        const tokenResponse: TokenResponse =
          await this.authService.generateToken42User(
            message.body.split(':')[1],
          );
        const userInfo: UserAPIResponse =
          await this.authService.getIntraUserInformation(
            tokenResponse.access_token,
          );
        this.userService.createUser({
          ft_id: userInfo.id,
          wafrom: message.from,
          accessToken: tokenResponse.access_token,
          login: userInfo.login,
          first_name: userInfo.first_name,
          last_name: userInfo.last_name,
          full_name: userInfo.usual_full_name,
          displayname: userInfo.displayname,
          refreshToken: tokenResponse.refresh_token,
          phone: userInfo.phone,
          campusID: userInfo.campus[0].id,
        });
        await this.sendTextMessage(
          message.from,
          `
Hi ${userInfo.usual_full_name},

You are authinticated succesfuly :)!
        `,
        );
        console.log(userInfo);
      } else if (
        message.body.includes('access') ||
        message.body.includes('Access')
      ) {
        const user = await this.userService.userByWhatsappFrom(message.from);
        await this.sendTextMessage(
          message.from,
          `Your access toker is ${user.accessToken}`,
        );
      }
    });
  }

  sendTextMessage(to: string, message: string) {
    this.whatsapp.sendText(to, message);
  }
}
