import type {
    IUniqueConnectionReadModel,
    IUniqueConnectionStore,
} from '../../types';

import HyperLogLog from 'hyperloglog-lite';

// HyperLogLog will create 2^n registers
const n = 12;

export class UniqueConnectionReadModel implements IUniqueConnectionReadModel {
    private uniqueConnectionStore: IUniqueConnectionStore;

    constructor(uniqueConnectionStore: IUniqueConnectionStore) {
        this.uniqueConnectionStore = uniqueConnectionStore;
    }

    async getStats() {
        const [previous, current] = await Promise.all([
            this.uniqueConnectionStore.get('previous'),
            this.uniqueConnectionStore.get('current'),
        ]);
        const previousHll = HyperLogLog(n);
        if (previous) {
            previousHll.merge({ n, buckets: previous.hll });
        }
        const currentHll = HyperLogLog(n);
        if (current) {
            currentHll.merge({ n, buckets: current.hll });
        }
        return { previous: previousHll.count(), current: currentHll.count() };
    }
}
