import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { UserService } from 'src/user/user.service';
import { FTRequest } from 'src/interfaces/ft-api.interface';

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
          Authorization: `Bearer ${request.access_token}`,
        },
      })
    ).data;
  }
}
