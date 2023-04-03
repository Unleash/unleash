import { Client } from 'pg';
import { IDBOption } from '../types';

const lockKey = 479341;

export const withDbLock =
    (dbConfig: IDBOption) =>
    <A extends any[], R>(fn: (...args: A) => Promise<R>) =>
    async (...args: A): Promise<R> => {
        const client = new Client(dbConfig);
        try {
            await client.connect();
            // wait to obtain a lock
            await client.query('SELECT pg_advisory_lock($1)', [lockKey]);
            return await fn(...args);
        } catch (e) {
            console.error('Locking error:', e);
            throw e;
        } finally {
            await client.query('SELECT pg_advisory_unlock($1)', [lockKey]);
            await client.end();
        }
    };
