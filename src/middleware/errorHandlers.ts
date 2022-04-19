import { Request, Response, NextFunction, Router } from 'express';
import * as ErrorHandler from '../utils/ErrorHandler';
import createHttpError from 'http-errors';

const handleError = (router: Router) => {
    router.use(
        (
            err: Error | SyntaxError | createHttpError.HttpError,
            _req: Request,
            res: Response,
            next: NextFunction
        ) => {
            ErrorHandler.serverError(err, res, next);
        }
    );
};

export default [handleError];
