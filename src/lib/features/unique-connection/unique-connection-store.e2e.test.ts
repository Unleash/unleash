import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import type {
    IUniqueConnectionStore,
    IUnleashStores,
} from '../../../lib/types/index.js';
import HyperLogLog from 'hyperloglog-lite';
import { isAfter } from 'date-fns';

let stores: IUnleashStores;
let db: ITestDb;
let uniqueConnectionStore: IUniqueConnectionStore;

beforeAll(async () => {
    db = await dbInit('unique_connections_store', getLogger);
    stores = db.stores;
    uniqueConnectionStore = stores.uniqueConnectionStore;
});

afterAll(async () => {
    await db.destroy();
});

beforeEach(async () => {
    await uniqueConnectionStore.deleteAll();
});

test('should store empty HyperLogLog buffer', async () => {
    const hll = HyperLogLog(12);
    await uniqueConnectionStore.insert({
        id: 'current',
        hll: hll.output().buckets,
    });

    const fetchedHll = await uniqueConnectionStore.get('current');
    hll.merge({ n: 12, buckets: fetchedHll!.hll });
    expect(hll.count()).toBe(0);
});

test('should store non empty HyperLogLog buffer', async () => {
    const hll = HyperLogLog(12);
    hll.add(HyperLogLog.hash('connection-1'));
    hll.add(HyperLogLog.hash('connection-2'));
    await uniqueConnectionStore.insert({
        id: 'current',
        hll: hll.output().buckets,
    });

    const fetchedHll = await uniqueConnectionStore.get('current');
    const emptyHll = HyperLogLog(12);
    emptyHll.merge({ n: 12, buckets: fetchedHll!.hll });
    expect(hll.count()).toBe(2);
});

test('should indicate when no entry', async () => {
    const fetchedHll = await uniqueConnectionStore.get('current');

    expect(fetchedHll).toBeNull();
});

test('should update updated_at date', async () => {
    const hll = HyperLogLog(12);
    hll.add(HyperLogLog.hash('connection-1'));
    hll.add(HyperLogLog.hash('connection-2'));

    await uniqueConnectionStore.insert({
        id: 'current',
        hll: hll.output().buckets,
    });
    const firstFetch = await uniqueConnectionStore.get('current');

    await uniqueConnectionStore.insert({
        id: 'current',
        hll: hll.output().buckets,
    });
    const secondFetch = await uniqueConnectionStore.get('current');

    expect(isAfter(secondFetch?.updatedAt!, firstFetch?.updatedAt!)).toBe(true);
});
