import dotenv from 'dotenv';
import logger from './logger';
import { init as initRedis } from './db';
import Server from './server';
import { ALL_CONSTS, SERVER_PORT } from './constants';

const log = logger(module.filename.split('/').slice(-2).join('/'));

/* -------------------------------------------------------------------------- */
/*                          Program Main Entry Point                          */
/* -------------------------------------------------------------------------- */

// Read ENV variables
dotenv.config();

// Log program entry point
log.info('Program entry point');

// Log Startup Settings
for (const key in ALL_CONSTS) {
    log.info(`${key} : ${ALL_CONSTS[key]}`);
}

// Initialize Redis client
Promise.resolve(initRedis());

// Create the server
const ExpressServer: Server = new Server(SERVER_PORT);

// Start the server
ExpressServer.listen();
