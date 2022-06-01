import {
    IRequestIntercomGetBody,
    IRequestIntercomSetBody,
    IRequestIntercomDelBody
} from '@zenotta/zenotta-js';
import { Request, Response, NextFunction } from 'express';

export const EMPTY_REQUEST_GET_BODY: IRequestIntercomGetBody = {
    key: '',
    publicKey: '',
    signature: ''
};

export const EMPTY_REQUEST_SET_BODY: IRequestIntercomSetBody<object> = {
    key: '',
    field: '',
    publicKey: '',
    signature: '',
    value: {}
};

export const EMPTY_REQUEST_DEL_BODY: IRequestIntercomDelBody = {
    key: '',
    field: '',
    publicKey: '',
    signature: ''
};

export type Handler = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<void> | void;

export type Route = {
    path: string;
    method: string;
    handler: Handler | Handler[];
};
