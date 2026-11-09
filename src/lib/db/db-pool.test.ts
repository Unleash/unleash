import { expect, test } from 'vitest';
import { createTestConfig } from '../../test/config/test-config.js';
import { createDb } from './db-pool.js';

test('waits for a pool connection no longer than the configured acquireConnectionTimeout', async () => {
    const config = createTestConfig({ db: { acquireConnectionTimeout: 1234 } });
    const db = createDb(config);
    try {
        expect(db.client.pool.acquireTimeoutMillis).toBe(1234);
    } finally {
        await db.destroy();
    }
});
