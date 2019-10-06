import { Controller } from './Controller';
import { Request, Response } from 'restify';
import { ApiServer } from '../server';

export class PingController implements Controller {
	public server: ApiServer;

	constructor (server: ApiServer) {
		this.server = server;
	}

	public initialize(): void {
		this.server!.get('/ping', (_: Request, res: Response) => res.send(200, { code: 200, message: 'Pong!' }));
		this.server.get('/', (_: Request, res: Response) => res.redirect('https://sycer.dev/', () => this.server.logger.verbose('[REDIRECT] / to home page')))
	}
}