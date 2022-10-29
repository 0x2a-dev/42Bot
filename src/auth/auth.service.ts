import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class AuthService {

  token: string;

  constructor(private httpService: HttpService, private configService: ConfigService) {
  }

  async generateToken42User(code: string) {
    // console.log(code.code);
    try{
      let res: any = (await this.httpService.axiosRef.post('https://api.intra.42.fr/oauth/token',
          {
            grant_type: 'authorization_code',
            client_id: this.configService.get('CID'),
            client_secret: this.configService.get('SECRECT'),
            code,
            redirect_uri: `${this.configService.get('APP_URL')}/logme`,
            // maxAge: 60 * 60 * 60 * 60 * 60 *2,
            scope: "public projects",
          }));
          console.log(res.data);
        return res.data;
    } catch (e) {
      console.log(e);
    }
  }

}
