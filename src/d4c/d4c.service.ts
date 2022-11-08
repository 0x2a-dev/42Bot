import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from 'src/auth/auth.service';
import { BotService } from 'src/bot/bot.service';
import { FtApiService } from 'src/ft-api/ft-api.service';
import { TimeutilsService } from 'src/timeutils/timeutils.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class D4cService {
  constructor(
    private timeUtilsService: TimeutilsService,
    private configService: ConfigService,
    private ftApiService: FtApiService,
    private userService: UserService,
    private authService: AuthService,
  ) {}

  async userEligibliityCheck(userWANumber: string): Promise<any> {
    const access_token = await this.userService.getUserAccessTokenByPhone(
      userWANumber,
    );
    const user = await this.authService.getIntraUserInformation(access_token);
    const totalTime: number = await this.getTotalHoursWorkedInLab(
      user,
      await this.authService.getGeneralAccessToken(),
    );
    const blackholed_at = user.cursus_users.find(
      (cursus) => cursus.cursus.name === '42cursus',
    ).blackholed_at;
    return {
      eligible: this.isEligible(totalTime, blackholed_at),
      totalTime,
      days_to_blackhole: this.timetoblackhole(blackholed_at),
    };
  }

  async getTotalHoursWorkedInLab(
    user: any,
    access_token: string,
  ): Promise<number> {
    try {
      const logs = await this.ftApiService._get({
        url: `/users/${user.login}/locations_stats`,
        access_token: access_token,
        params: {
          'page[size]': '100',
        },
        user: user,
      });
      let totalSeconds = 0;
      // console.log('logs:', logs);
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const date_str = date.toISOString().slice(0, 10);
        if (logs && this.arrayHasKey(logs, date_str)) {
          const user_time = logs[date_str];
          totalSeconds += this.timeUtilsService.getTimeinSeconds(user_time);
          console.log(date_str + ': ' + totalSeconds);
        }
      }

      return totalSeconds;
    } catch (e) {
      console.log(e);
    }
  }

  arrayHasKey(arr, key) {
    if (key in arr) {
      return true;
    }
    return false;
  }

  isEligible(time: number, blackhole: string) {
    if (
      Math.floor(time / this.timeUtilsService.HOUR_IN_SECONDS) >
        this.configService.get('D4C_HOURS_PER_WEEK') &&
      this.timetoblackhole(blackhole) <
        this.configService.get('D4C_DAYS_FROM_BLACKHOLE')
    ) {
      return true;
    }
    return false;
  }

  timetoblackhole(blackhole): any {
    return (
      (new Date(blackhole).getTime() - new Date().getTime()) /
      (this.timeUtilsService.HOUR_IN_SECONDS * 24 * 1000)
    );
  }
}
