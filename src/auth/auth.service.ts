import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { TokenResponse } from 'src/interfaces/ft-api.interface';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  token: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    private userService: UserService,
  ) {}

  async getGeneralAccessToken() {
    try {
      const response = await this.httpService.axiosRef.post(
        'https://api.intra.42.fr/oauth/token',
        {
          grant_type: 'client_credentials',
          client_id: this.configService.get('CID'),
          client_secret: this.configService.get('SECRECT'),
        },
      );
      this.token = response.data.access_token;
      return this.token;
    } catch (e) {
      console.log(e);
    }
  }

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

  async refreshUserExpiredToken(userfrom: string, refreshToken: string) {
    const user: any = await this.userService.userByWhatsappFrom(userfrom);
    try {
      const res: TokenResponse = (
        await this.httpService.axiosRef.post(
          'https://api.intra.42.fr/oauth/token',
          {
            grant_type: 'refresh_token',
            client_id: this.configService.get('CID'),
            client_secret: this.configService.get('SECRECT'),
            refresh_token: refreshToken,
            redirect_uri: `${this.configService.get('APP_URL')}/logme`,
            // scope: this.configService.get('SCOPE'),
          },
        )
      ).data;
      await this.userService.updateUser({
        where: {
          wafrom: userfrom,
        },
        data: {
          ft_id: user.ft_id,
          wafrom: user.wa_from,
          accessToken: res.access_token,
          tkn_creation: res.created_at,
          login: user.login,
          first_name: user.first_name,
          last_name: user.last_name,
          full_name: user.usual_full_name,
          displayname: user.displayname,
          refreshToken: res.refresh_token,
          phone: user.phone,
          campusID: user.campus[0].id,
        },
      });
      // console.log(res.data);
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
