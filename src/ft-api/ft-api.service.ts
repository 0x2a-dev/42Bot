import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { UserService } from 'src/user/user.service';

interface FTRequest {
  url: string;
  data?: any;
  params?: {
    [key: string]: string;
  };
  user?: any;
}

@Injectable()
export class FtApiService {
  readonly FTAPIURL: string = 'https://api.intra.42.fr/v2';

  constructor(
    private readonly httpService: HttpService,
    private userService: UserService,
  ) {}

  async _get(request: FTRequest) {
    return (
      await this.httpService.axiosRef.get(`${this.FTAPIURL}${request.url}`, {
        params: request.params,
        data: request.data,
        headers: {
          Authorization: `Bearer ${this.userService.getUserAccessTokenByPhone(
            request.user,
          )}`,
        },
      })
    ).data;
  }
}
