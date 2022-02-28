import { Request, Response, NextFunction, Router } from 'express';
import * as ErrorHandler from '../utils/ErrorHandler';

const handle404Error = (router: Router) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    router.use((_req: Request, _res: Response) => {
        ErrorHandler.notFoundError();
    });
};

type ErrorWithCode = Error & { code?: string };

const handleClientError = (router: Router) => {
    router.use(
        (
            err: ErrorWithCode,
            _req: Request,
            res: Response,
            next: NextFunction
        ) => {
            ErrorHandler.clientError(err, res, next);
        }
    );
};

const handleServerError = (router: Router) => {
    router.use(
        (err: Error, _req: Request, res: Response, next: NextFunction) => {
            ErrorHandler.serverError(err, res, next);
        }
    );
};

export default [handle404Error, handleClientError, handleServerError];
