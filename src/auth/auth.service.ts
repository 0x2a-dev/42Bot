import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class AuthService {
  token: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async generateToken42User(code: string) {
    // console.log(code.code);
    try {
      const res: any = await this.httpService.axiosRef.post(
        'https://api.intra.42.fr/oauth/token',
        {
          grant_type: 'authorization_code',
          client_id: this.configService.get('CID'),
          client_secret: this.configService.get('SECRECT'),
          code,
          redirect_uri: `${this.configService.get('APP_URL')}/logme`,
          scope: this.configService.get('SCOPE'),
        },
      );
      console.log(res.data);
      return res.data;
    } catch (e) {
      console.log(e);
    }
  }

  async getIntraUserInformation(accessToken: string) {
    try {
      const res: any = await this.httpService.axiosRef.get(
        'https://api.intra.42.fr/v2/me',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      return res.data;
    } catch (e) {
      console.log(e);
    }
  }
}
