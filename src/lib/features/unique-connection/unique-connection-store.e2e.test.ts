import dbInit, { type ITestDb } from '../../../test/e2e/helpers/database-init';
import getLogger from '../../../test/fixtures/no-logger';
import type {
    IUniqueConnectionStore,
    IUnleashStores,
} from '../../../lib/types';
import HyperLogLog from 'hyperloglog-lite';

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
