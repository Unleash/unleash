import { Client } from 'pg';
import { IDBOption } from '../types';
import { Logger } from '../logger';

export const defaultLockKey = 479341;
export const defaultTimeout = 5000;

interface IDbLockOptions {
    timeout: number;
    lockKey: number;
    logger: Logger;
}

const defaultOptions: IDbLockOptions = {
    timeout: defaultTimeout,
    lockKey: defaultLockKey,
    logger: { ...console, fatal: console.error },
};

export const withDbLock =
    (dbConfig: IDBOption, config = defaultOptions) =>
    <A extends any[], R>(fn: (...args: A) => Promise<R>) =>
    async (...args: A): Promise<R> => {
        const client = new Client({
            ...dbConfig,
            query_timeout: config.timeout,
        });
        try {
            await client.connect();
            // wait to obtain a lock
            await client.query('SELECT pg_advisory_lock($1)', [config.lockKey]);
            const result = await fn(...args);
            return result;
        } catch (e) {
            config.logger.error(`Locking error: ${e.message}`);
            throw e;
        } finally {
            await client.query('SELECT pg_advisory_unlock($1)', [
                config.lockKey,
            ]);
            await client.end();
        }
    };
