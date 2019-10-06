import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '..', '.env') });

import SettingsProvider from './database/classes/SettingsProvider';
import { ApiServer } from './api/server/index';

const ENVS = ['MONGO', 'TOKEN', 'PORT'];

function check() {
	for (const env of ENVS) {
		if (!process.env[env] || process.env[env] == undefined) {
			console.error(`[ENVS] Please add ${env} and try again!`);
			process.exit(1);
		} else console.info(`[ENVS] Found process.env.${env}.`);
	}
}

async function start() {
    const API = new ApiServer();

	const settings = new SettingsProvider(API);
	await settings.init();

	API.settings = settings;
	return API.start(+process.env.PORT! || 80);
}

check();
start();
