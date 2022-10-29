import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TimeutilsService } from 'src/timeutils/timeutils.service';

@Injectable()
export class D4cService {
  constructor(
    private timeUtilsService: TimeutilsService,
    private configService: ConfigService,
  ) {}

  // userEligibliityCheck(user) {

  // }

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
