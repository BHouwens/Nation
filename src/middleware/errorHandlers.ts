/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction, Router } from 'express';
import { logger } from '../logger';
import createHttpError from 'http-errors';
import { IS_PRODUCTION } from '../constants';

const handle404Error = (router: Router) => {
    router.use((req: Request, res: Response) => {
        logger.warn(`Method not found: ${req.method} ${req.url}`);
        res.status(404).send(`Method not found: ${req.method} ${req.url}`);
    });
};

const handleError = (router: Router) => {
    router.use(
        (
            err: Error | SyntaxError | createHttpError.HttpError,
            _req: Request,
            res: Response,
            next: NextFunction
        ) => {
            if (createHttpError.isHttpError(err)) {
                // HttpError (rate-limit reached, payload too large, etc...)
                logger.warn(`${err}`);
                res.status(err.status).send(err.message);
            } else if (err instanceof SyntaxError) {
                // SyntaxError (Bad request)- happens when request body is invalid JSON
                logger.warn(`${err}`);
                res.status(400).send(err.message);
            } else if (err instanceof Error) {
                // Log internal errors
                IS_PRODUCTION
                    ? logger.error(err.message)
                    : logger.error(err.stack);
                res.status(500).send(
                    IS_PRODUCTION ? 'Internal Server Error' : err.message
                );
            }
        }
    );
};

export default [handleError, handle404Error];
