import { Client } from 'pg';
import type { IDBOption, Logger } from '../server-impl.js';
import { getDBPassword } from './aws-iam.js';

export const dbAccessChecker = async (db: IDBOption, logger: Logger) => {
    if (!db.awsIamAuth) return;

    logger.info(
        'Using AWS IAM authentication for database connection. Checking DB access...',
    );

    const password = await getDBPassword(db);

    const client = new Client({
        host: db.host,
        port: db.port,
        user: db.user,
        database: db.database,
        password,
        statement_timeout: 10_000,
        connectionTimeoutMillis: 10_000,
    });
    try {
        await client.connect();
        await client.query('SELECT 1');
        logger.info('DB auth/connection successful');
    } catch (e: any) {
        const code = e?.code ?? 'unknown';
        throw new Error(`DB auth/connection failed (pg code: ${code})`);
    } finally {
        await client.end().catch(() => {});
    }
};
