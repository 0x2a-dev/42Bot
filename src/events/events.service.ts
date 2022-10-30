import { Injectable } from '@nestjs/common';
import { FtApiService } from 'src/ft-api/ft-api.service';

@Injectable()
export class EventsService {
  constructor(private ftApiService: FtApiService) {}

  async getEvents(access_token: string, user: any) {
    try {
      const res = await this.ftApiService._get({
        url: `/events`,
        access_token: access_token,
        params: {
          'filter[campus_id]': 43,
          'page[size]': '100',
        },
        user: user,
      });
      return res;
    } catch (e) {
      console.log(e);
    }
  }
}
