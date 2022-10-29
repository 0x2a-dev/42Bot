import { Injectable } from '@nestjs/common';
import { create } from '@open-wa/wa-automate';
import { ConfigService } from '@nestjs/config';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';

export interface Token {
	access_token: string;
	token_type: string;
	expires_in: number;
	scope: string;
	created_at: number;
	[key: string]: any;
}

@Injectable()
export class BotService {

	private whatsapp: any;

	constructor(private configService: ConfigService, private authService: AuthService, private userService: UserService) {
	}

	async init() {
		create({
			sessionId: "42BOT",
			multiDevice: true, //required to enable multiDevice support
			authTimeout: 60, //wait only 60 seconds to get a connection with the host account device
			blockCrashLogs: true,
			disableSpins: true,
			headless: true,
			logConsole: false,
			popup: true,
			qrTimeout: 0, //0 means it will wait forever for you to scan the qr code
		}).then((client) => {
			this.whatsapp = client;
			this.start();
		}).catch((err) => { console.log(err) });
	}

	start() {
		this.whatsapp.onMessage(async message => {
			if (message.body === 'Hi') {
				await this.sendTextMessage(message.from, 
					`Hello!
					Please click on the link below to login to 42 API (you will be redirected afterwords to the chatbot so you can send us the code):
					https://api.intra.42.fr/oauth/authorize?client_id=${this.configService.get('CID')}&redirect_uri=${this.configService.get('REDIRECT_URI')}&response_type=code&&scope=${this.configService.get('SCOPE')}`);
			}
			else if (message.body.includes("tk:")) {
				let code = message.body.split(":")[1];
				let token: Token = await this.authService.generateToken42User(code);
				await this.sendTextMessage(message.from, `Your token is: ${token.access_token}`);
			}
		});
	}

	sendTextMessage(to: string, message: string) {
		this.whatsapp.sendText(to, message);
	}
}
