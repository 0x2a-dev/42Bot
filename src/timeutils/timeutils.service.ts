import { Injectable } from '@nestjs/common';

@Injectable()
export class TimeutilsService {
  readonly HOUR_IN_SECONDS = 3600;
  readonly MINUTE_IN_SECOUDS = 60;

  getTimeinSeconds(time: string) {
    if (time != null) {
      const splitted = time.split(':');
      return (
        parseInt(splitted[0]) * this.HOUR_IN_SECONDS +
        parseInt(splitted[1]) * this.MINUTE_IN_SECOUDS +
        parseInt(splitted[2])
      );
    } else {
      return 0;
    }
  }

  getHoursOutofSeconds(time: number) {
    const hours = Math.floor(time / this.HOUR_IN_SECONDS);
    const minutes = Math.floor(
      (time % this.HOUR_IN_SECONDS) / this.MINUTE_IN_SECOUDS,
    );
    const seconds = Math.floor(
      (time % this.HOUR_IN_SECONDS) % this.MINUTE_IN_SECOUDS,
    );
    return hours + ':' + minutes + ':' + seconds;
  }
}
