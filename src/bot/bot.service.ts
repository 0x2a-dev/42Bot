import { Injectable } from '@nestjs/common';
import { create } from '@open-wa/wa-automate';
import { ConfigService } from '@nestjs/config';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  created_at: number;
  [key: string]: any;
}

export interface Campus {
  id: number;
  name: string;
}

export interface UserAPIResponse {
  id: number;
  email: string;
  login: string;
  first_name: string;
  last_name: string;
  usual_full_name: string;
  displayname: string;
  phone: 'hidden' | string;
  kind: 'student';
  campus: [Campus];
}

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
      if (message.body === 'Hi') {
        await this.sendTextMessage(
          message.from,
          `Hello!
					Please click on the link below to login to 42 API (you will be redirected afterwords to the chatbot so you can send us the code):
					https://api.intra.42.fr/oauth/authorize?client_id=${this.configService.get(
            'CID',
          )}&redirect_uri=${this.configService.get(
            'REDIRECT_URI',
          )}&response_type=code&&scope=${this.configService.get('SCOPE')}`,
        );
      } else if (message.body.includes('tk:')) {
        let code = message.body.split(':')[1];
        let tokenResponse: TokenResponse =
          await this.authService.generateToken42User(code);
        let userInfo: UserAPIResponse =
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
      }
    });
  }

  sendTextMessage(to: string, message: string) {
    this.whatsapp.sendText(to, message);
  }
}
