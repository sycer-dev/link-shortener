import Collection from '@discordjs/collection';
import { connect, Model } from 'mongoose';
import LinkModel, { Link } from '../models/Link';
import { ApiServer } from '../../api/server';
import { Logger } from 'winston';
let i = 0;

export interface Models { [key: string]: Model<any> };

export type Types = 'link';

export type ModelTypes = Link;

const MODELS = {
	link: LinkModel
}

export default class SettingsProvider {
	public server: ApiServer;

	public link: Collection<string, Link>;

	public LinkModel: Model<Link>;

	public constructor(server: ApiServer) {
		/* the server */
		this.server = server;

		/* our document collections */
		this.link = new Collection();

		/* our models */
		this.LinkModel = LinkModel;
	}

	/* creates new model with provided data */
	public async new(type: Types, data: object): Promise<ModelTypes> {
		const model = MODELS[type];
		const doc = new model(data);
		this[type].set(doc.id, doc as any);
		await doc.save();
		this.server.logger.verbose(`[DATABASE] Made new ${model.modelName} document with ID of ${doc._id}.`);
		return doc;
	}

	/* setting options of an existing document */
	public async set(type: Types, data: object, key: object): Promise<ModelTypes | null> {
		const model = MODELS[type];
		const doc = await model.findOneAndUpdate(data, { $set: key }, { 'new': true });
		if (!doc) return null;
		this.server.logger.verbose(`[DATABASE] Edited ${model.modelName} document with ID of ${doc._id}.`);
		this[type].set(doc.id, doc as any);
		return doc;
	}

	/* removes a document with the provider query */
	public async remove(type: Types, data: any): Promise<ModelTypes | null> {
		const model = MODELS[type];
		const doc = await model.findOneAndDelete(data);
		if (!doc) return null;
		this[type].delete(doc._id);
		this.server.logger.verbose(`[DATABASE] Deleted ${model.modelName} document with ID of ${doc._id}.`);
		return doc;
	}

	/* caching documents */
	public async cacheAll(): Promise<number> {
		const map = Object.entries(MODELS);
		for (const [type, model] of map) await this._cache(type as any, model);
		return i;
	}

	private async _cache(type: Types, model: Model<any>): Promise<any> {
		const collection = this[type];
		const items = await model.find();
		for (const i of items) collection.set(i.id, i);
		return i += items.length;
	}

	/* connecting */
	private async _connect(url: string | undefined): Promise<Logger> {
		if (url) {
			const start = Date.now();
			try {
				await connect(url, {
					useCreateIndex: true,
					useNewUrlParser: true,
					useFindAndModify: false,
				});
			} catch (err) {
				this.server.logger.error(`[DATABASE] Error when connecting to MongoDB:\n${err.stack}`);
				return process.exit(1);
			}
			return this.server.logger.info(`[DATABASE] Connected to MongoDB in ${Date.now() - start}ms.`);
		}
		this.server.logger.error('[DATABASE] No MongoDB url provided!');
		return process.exit(1);
	}

	public async init(): Promise<void> {
		await this._connect(process.env.MONGO);
		await this.cacheAll();
		this.server.logger.info(`[DATABASE] [LAUNCHED] Successfully connected and cached ${i} documents.`);
	}
}
