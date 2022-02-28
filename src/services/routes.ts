import {
    authenticateDel,
    authenticateGet,
    authenticateSet,
    delDB,
    getDb,
    setDb,
    verifyRequestDelBody,
    verifyRequestGetBody
} from '.';
import { Route } from '../interfaces';
import { verifyRequestSetBody } from './index';

export default [
    {
        path: '/set_data',
        method: 'post',
        handler: [verifyRequestSetBody, authenticateSet, setDb]
    } as Route,
    {
        path: '/get_data',
        method: 'post',
        handler: [verifyRequestGetBody, authenticateGet, getDb]
    } as Route,
    {
        path: '/del_data',
        method: 'post',
        handler: [verifyRequestDelBody, authenticateDel, delDB]
    } as Route
];
