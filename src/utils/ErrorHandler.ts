import { Response, NextFunction } from 'express';
import { HTTPClientError, HTTP404Error } from '../utils/httpErrors';
import logger from '../logger';
import { IS_PRODUCTION } from '../constants';

const log = logger(module.filename.split('/').slice(-3).join('/'));

export const notFoundError = () => {
    throw new HTTP404Error();
};

export const clientError = (err: Error, res: Response, next: NextFunction) => {
    if (err instanceof HTTPClientError) {
        const { message, statusCode } = err;
        if (IS_PRODUCTION) log.warn(message);
        res.status(statusCode).send(message);
    } else {
        next(err);
    }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const serverError = (err: Error, res: Response, _next: NextFunction) => {
    if (!IS_PRODUCTION) {
        log.error(err.stack);
        res.status(500).send(err.message);
    } else {
        res.status(500).send('Internal Server Error');
    }
};
