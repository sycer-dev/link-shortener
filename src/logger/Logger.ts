import { createLogger, format, Logger, transports } from 'winston';
import { LoggerConfig } from './LoggerConfig';

export const logger: Logger = createLogger({
    levels: LoggerConfig.levels,
    format: format.combine(
        format.colorize({ level: true }),
        format.errors({ stack: true }),
        format.splat(),
        format.timestamp({ format: 'MM/DD/YYYY HH:mm:ss' }),
        format.printf((data: any) => {
            const { timestamp, level, message, ...rest } = data;
            return `[${timestamp}] ${level}: ${message}${Object.keys(rest).length ? `\n${JSON.stringify(rest, null, 2)}` : ''}`;
        }),
    ),
    transports: new transports.Console(),
    level: 'custom',
});;