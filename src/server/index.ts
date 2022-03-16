import express from 'express';
import logger from '../logger';
import { applyMiddleware, applyRoutes } from '../utils/index';
import commonHandlers from '../middleware/common';
import errorHandlers from '../middleware/errorHandlers';
import routes from '../services/routes';

const log = logger(module.filename.split('/').slice(-3).join('/'));

process.on('uncaughtException', (e) => {
    log.error(`uncaughtException: ${e.message}`);
    process.exit(1);
});

process.on('unhandledRejection', (e) => {
    log.error(`unhandledRejection: ${e}`);
    process.exit(1);
});

/* -------------------------------------------------------------------------- */
/*                                Server Module                               */
/* -------------------------------------------------------------------------- */

export default class Server {
    // Express server member
    private app: express.Application = express();

    constructor(private port: string | number) {
        this.app = express();
        // Apply rate-limiters
        applyMiddleware(commonHandlers, this.app);
        // Add routes
        applyRoutes(routes, this.app);
        // Apply error handlers
        applyMiddleware(errorHandlers, this.app);
    }

    /**
     * Start the server
     */
    public listen(): void {
        this.app
            .listen(this.port, () => {
                log.debug(`Server running on port ${this.port} ⚡`);
            })
            .on('error', (err) => log.error(`Error starting server: ${err}`));
    }
}
