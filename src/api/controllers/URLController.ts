import { Controller } from './Controller';
import { Request, Response } from 'restify';
import { ApiServer } from '../server';

export class URLController implements Controller {
	public server: ApiServer;

	constructor (server: ApiServer) {
		this.server = server;
	}

	public initialize(): void {
		this.server.get('/:code', this.redirect.bind(this));
		this.server.get('/url/:code', this.show.bind(this));
		this.server!.post('/url/:short/:long', this.create.bind(this))
		this.server!.put('/url/:short', this.update.bind(this))
		this.server!.del('/url/:short', this.remove.bind(this))
	}

	private redirect(req: Request, res: Response): void {
		const doc = this.server.settings!.link.find(e => e.short === req.params.code);
		if (!doc) return res.send(404, { code: 404, message: 'Short URL not found.' });
		const visits = doc!.visits + 1;
		this.server.settings!.set('link', { _id: doc._id }, { visits });
		return res.redirect(`https://${doc.long}`, () => this.server.logger.verbose(`[REDIRECT] ${doc.short}`));
	}

	private show(req: Request, res: Response): void {
		if (req.query.token !== process.env.TOKEN) return res.send(401, { code: 401, message: 'Invalid token provided.' });
		const doc = this.server.settings!.link.find(e => e.short === req.params.code);
		if (!doc) return res.send(404, { code: 404, message: 'Short URL not found' });;
		return res.send(200, doc);	
	}

	private async create(req: Request, res: Response): Promise<void> {
		if (req.query.token !== process.env.TOKEN) return res.send(401, 'Unauthorized.');
		const existing = this.server.settings!.link.find(u => u.short === req.params.short);
		if (existing) return res.send(409, { code: 409, message: `${req.params.short} already exists.` });
		const doc = await this.server!.settings!.new('link', { long: req.params.long, short: req.params.short });
		return res.send(200, doc);
	}

	private async update(req: Request, res: Response): Promise<void> {
		if (req.query.token !== process.env.TOKEN) return res.send(401, { code: 401, message: 'Unauthorized.' });
		const existing = this.server.settings!.link.find(u => u.short === req.params.short);
		if (!existing) return res.send(404, { code: 404, message: `${req.params.short} doesn't exists.` });
		const doc = await this.server!.settings!.set('link', { _id: existing._id }, { long: req.params.long, short: req.params.short });
		return res.send(200, doc);
	}

	private async remove(req: Request, res: Response): Promise<void> {
		if (req.query.token !== process.env.TOKEN) return res.send(401, 'Unauthorized.');
		const doc = this.server.settings.link.find(l => l.short === req.params.short);
		if (!doc) return res.send(404, { code: 404, message: `${req.params.short} doesn't exists.` });
		try {
			await this.server!.settings!.remove('link', { _id: doc._id });
			return res.send(200, doc);
		} catch {
			return res.send(500);
		}
	}
}