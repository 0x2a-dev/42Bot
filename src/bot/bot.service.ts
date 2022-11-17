import { Injectable } from '@nestjs/common';
import { create } from '@open-wa/wa-automate';
import { ConfigService } from '@nestjs/config';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { D4cService } from 'src/d4c/d4c.service';
import { TimeutilsService } from 'src/timeutils/timeutils.service';
import {
  TokenResponse,
  UserAPIResponse,
} from 'src/interfaces/ft-api.interface';
import { EventsService } from 'src/events/events.service';

@Injectable()
export class BotService {
  private whatsapp: any;

  constructor(
    private configService: ConfigService,
    private authService: AuthService,
    private userService: UserService,
    private d4cService: D4cService,
    private timeUtilsService: TimeutilsService,
    private eventsService: EventsService,
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
      const user = await this.userService.userByWhatsappFrom(message.from);
      if (
        user &&
        this.timeUtilsService.getTimestampInSeconds() -
          (user.tkn_creation | 0) >
          7200
      ) {
        this.authService.refreshUserExpiredToken(
          message.from,
          user.refreshToken,
        );
      }
      if (!message.body.includes('tk:') && (!user || message.body === 'Hi')) {
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
          tkn_creation: tokenResponse.created_at,
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

You are authenticated succesfuly :)!
        `,
        );
        console.log(userInfo);
      } else if (
        message.body === 'D4C' ||
        message.body === 'D4c' ||
        message.body === 'd4c'
      ) {
        const eligiblilty = await this.d4cService.userEligibliityCheck(
          message.from,
        );
        console.log(eligiblilty);
        this.sendTextMessage(
          message.from,
          `
          You have worked ${this.timeUtilsService.getHoursOutofSeconds(
            eligiblilty.totalTime,
          )} hours this week.
You have ${Math.floor(
            eligiblilty.days_to_blackhole,
          )} days left before your blackhole date.
You are ${eligiblilty.eligible ? '*eligible*' : '*not eligible*'} for D4C.`,
        );
      } else if (message.body === 'events' || message.body === 'Events') {
        const events = await this.eventsService.getEvents(
          user.accessToken as string,
          user,
        );
        console.log(events);
        this.sendTextMessage(
          message.from,
          `
          You have ${events.length} events upcomping.
          `,
        );
      } else if (message.body === 'help' || message.body === 'Help') {
        this.sendTextMessage(
          message.from,
          `
          Hi, I am 42BOT, I can help you with the following commands:
  - Hi: to authinticate
  - D4C: Check your D4C eligibility
  - Events: Check your events for this week
  - Help: Show this message

Source code: https://github.com/0x2a-dev/42Bot
          `,
        );
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
