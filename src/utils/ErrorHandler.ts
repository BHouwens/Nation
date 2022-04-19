/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Response, NextFunction } from 'express';
import logger from '../logger';
import { IS_PRODUCTION } from '../constants';
import createHttpError from 'http-errors';

const log = IS_PRODUCTION
    ? logger()
    : logger(module.filename.split('/').slice(-3).join('/'));

export const serverError = (
    err: Error | SyntaxError | createHttpError.HttpError,
    res: Response,
    _next: NextFunction
) => {
    if (createHttpError.isHttpError(err)) {
        // HttpError (rate-limit reached, payload too large, etc...)
        log.warn(`${err}`);
        res.status(err.status).send(err.message);
    } else if (err instanceof SyntaxError) {
        // SyntaxError (Bad request)- happens when request body is invalid JSON
        log.warn(`${err}`);
        res.status(400).send(err.message);
    } else if (err instanceof Error) {
        // Log internal errors
        IS_PRODUCTION ? log.error(err.message) : log.error(err.stack);
        res.status(500).send(
            IS_PRODUCTION ? 'Internal Server Error' : err.message
        );
    }
};
