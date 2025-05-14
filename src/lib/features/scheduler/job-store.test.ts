import { createTestConfig } from '../../../test/config/test-config.js';
import { JobStore } from './job-store.js';
import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';

let db: ITestDb;
const config = createTestConfig();
beforeAll(async () => {
    db = await dbInit('job_store_serial', config.getLogger);
});

afterAll(async () => {
    await db.destroy();
});

test('cannot acquireBucket twice', async () => {
    const store = new JobStore(db.rawDatabase, config);
    // note: this might be flaky if the test runs exactly at 59 minutes and 59 seconds of an hour and 999 milliseconds but should be unlikely
    const bucket = await store.acquireBucket('test', 60);
    expect(bucket).toBeDefined();
    const bucket2 = await store.acquireBucket('test', 60);
    expect(bucket2).toBeUndefined();
});

test('Can acquire bucket for two different key names within the same period', async () => {
    const store = new JobStore(db.rawDatabase, config);
    const firstBucket = await store.acquireBucket('first', 60);
    const secondBucket = await store.acquireBucket('second', 60);
    expect(firstBucket).toBeDefined();
    expect(secondBucket).toBeDefined();
});
