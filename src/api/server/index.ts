import * as restify from 'restify';
import { RequestHandler, Server } from 'restify';
import { Logger } from 'winston';
import SettingsProvider from '../../database/classes/SettingsProvider';
import { logger } from '../../logger/Logger';
import { CONTROLLERS } from '../controllers/index';
import { HttpServer } from './httpServer';

export class ApiServer implements HttpServer {
	private restify!: Server;
    public settings!: SettingsProvider;
    public logger: Logger;

    public constructor() {
        this.settings = new SettingsProvider(this);
        this.logger = logger;
    }

    public get(url: string, requestHandler: RequestHandler): void {
        this.addRoute('get', url, requestHandler);
    }

    public post(url: string, requestHandler: RequestHandler): void {
        this.addRoute('post', url, requestHandler);
    }

    public del(url: string, requestHandler: RequestHandler): void {
        this.addRoute('del', url, requestHandler);
    }

    public put(url: string, requestHandler: RequestHandler): void {
        this.addRoute('put', url, requestHandler);
    }

    private addRoute(method: 'get' | 'post' | 'put' | 'del', url: string, requestHandler: RequestHandler): void {
        this.restify![method](url, async (req, res, next) => {
            try {
                await requestHandler(req, res, next);
            }
            catch (e) {
                this.logger.error(e);
                res.send(500, e);
            }
        });
        this.logger.info(`[API] [ADDED ROUTE] ${method.toUpperCase()}: ${url}.`)
    }

    public start(port: number): void {
        this.restify = restify.createServer();
        this.restify.use(restify.plugins.queryParser());
        this.restify.use(restify.plugins.bodyParser());

        this.addControllers();

        this.restify.listen(port, () => this.logger.info(`[API] API up and running on port ::${port}::.`));
    }

    private addControllers(): void {
        CONTROLLERS.forEach(Controller => {
            const c = new Controller(this);
            c.initialize();
        });
    }
}