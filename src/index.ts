import dotenv from 'dotenv';
import logger from './logger';
import { init as initRedis } from './db';
import Server from './server';

const log = logger(module.filename.split('/').slice(-2).join('/'));

/* -------------------------------------------------------------------------- */
/*                          Program Main Entry Point                          */
/* -------------------------------------------------------------------------- */

// Read ENV variables
dotenv.config();

// Log program entry point
log.info('Program entry point');

// Initialize Redis client
Promise.resolve(initRedis());

// Create the server
const ExpressServer: Server = new Server(process.env.PORT || 3002);

// Start the server
ExpressServer.listen();
