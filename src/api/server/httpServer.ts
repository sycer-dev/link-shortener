import { RequestHandler } from 'restify';
import SettingsProvider from '../../database/classes/SettingsProvider';

export interface HttpServer {
	settings: SettingsProvider;

	get(url: string, requestHandler: RequestHandler): void;

	post(url: string, requestHandler: RequestHandler): void;

	del(url: string, requestHandler: RequestHandler): void;

	put(url: string, requestHandler: RequestHandler): void;
}