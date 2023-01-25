import express from 'express';
import { logger } from '../logger';
import { applyMiddleware, applyRoutes } from '../utils';
import commonHandlers from '../middleware/common';
import errorHandlers from '../middleware/errorHandlers';
import routes from '../services/routes';

/* -------------------------------------------------------------------------- */
/*                                Server Module                               */
/* -------------------------------------------------------------------------- */

export default class Server {
    // Express server member
    private readonly app: express.Application = express();

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
                logger.debug(`Server running on port ${this.port} ⚡`);
            })
            .on('error', (err) =>
                logger.error(`Error starting server: ${err}`)
            );
    }
}
