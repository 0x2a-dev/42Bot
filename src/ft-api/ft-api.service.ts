import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

interface FTRequest {
  url: string;
  method: string;
  data?: any;
  params?: {
    [key: string]: string;
  };
  user?: any;
}

@Injectable()
export class FtApiService {
  readonly FTAPIURL: string = 'https://api.intra.42.fr/v2';

  constructor(private readonly httpService: HttpService) {}

  async _get(request: FTRequest) {
    return (
      await this.httpService.axiosRef.get(`${this.FTAPIURL}${request.url}`, {
        params: request.params,
        data: request.data,
        headers: {
          Authorization: `Bearer ${this.configService.get('TOKEN')}`,
        },
      })
    ).data;
  }
}
