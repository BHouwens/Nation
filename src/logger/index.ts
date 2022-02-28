import winston, { transports } from 'winston';
import Sentry from 'winston-transport-sentry-node';

/* -------------------------------------------------------------------------- */
/*                       Module To Create Logger Object                       */
/* -------------------------------------------------------------------------- */

const logger: winston.Logger = winston.createLogger({
    level: process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'silly',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.json(),
        winston.format.printf(({ module, timestamp, level, message }) => {
            return `[${module}] ${timestamp} [${level}]: ${message}`;
        })
    ),
    transports: [
        new transports.Console(),
        new Sentry({
            sentry: {
                dsn: process.env.SENTRY_DSN
            },
            handleExceptions: true
        })
    ]
});

export default function (name: string) {
    return logger.child({ module: name });
}
