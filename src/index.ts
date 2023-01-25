import dotenv from 'dotenv';
import { logger } from './logger';
import { init as initRedis } from './db';
import Server from './server';
import { ALL_CONSTS, SERVER_PORT } from './constants';

// Handle runtime exceptions
process.on('uncaughtException', (e) => {
    logger.error(`uncaughtException: ${e.message}`);
    process.exit(1);
});

process.on('unhandledRejection', (e) => {
    logger.error(`unhandledRejection: ${e}`);
    process.exit(1);
});

/* -------------------------------------------------------------------------- */
/*                          Program Main Entry Point                          */
/* -------------------------------------------------------------------------- */

// Read ENV variables
dotenv.config();

// Log program entry point
logger.info('Program entry point');

// Log Startup Settings
for (const key in ALL_CONSTS) {
    logger.debug(`${key} : ${ALL_CONSTS[key]}`);
}

// Initialize Redis client
Promise.resolve(initRedis()).then(() => {
    logger.info('Redis initialisation');
});

// Create the server
const ExpressServer: Server = new Server(SERVER_PORT);

// Start the server
ExpressServer.listen();
