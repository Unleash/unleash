import type {
    IUniqueConnectionReadModel,
    IUniqueConnectionStore,
} from '../../types';

import HyperLogLog from 'hyperloglog-lite';
import { REGISTERS_EXPONENT } from './hyperloglog-config';

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
        const previousHll = HyperLogLog(REGISTERS_EXPONENT);
        if (previous) {
            previousHll.merge({ n: REGISTERS_EXPONENT, buckets: previous.hll });
        }
        const currentHll = HyperLogLog(REGISTERS_EXPONENT);
        if (current) {
            currentHll.merge({ n: REGISTERS_EXPONENT, buckets: current.hll });
        }
        return { previous: previousHll.count(), current: currentHll.count() };
    }
}
