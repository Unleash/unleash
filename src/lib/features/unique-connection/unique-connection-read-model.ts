import type {
    IUniqueConnectionReadModel,
    IUniqueConnectionStore,
} from '../../types/index.js';

import HyperLogLog from 'hyperloglog-lite';
import { REGISTERS_EXPONENT } from './hyperloglog-config.js';

export class UniqueConnectionReadModel implements IUniqueConnectionReadModel {
    private uniqueConnectionStore: IUniqueConnectionStore;

    constructor(uniqueConnectionStore: IUniqueConnectionStore) {
        this.uniqueConnectionStore = uniqueConnectionStore;
    }

    async getStats() {
        const [
            previous,
            current,
            previousFrontend,
            currentFrontend,
            previousBackend,
            currentBackend,
        ] = await Promise.all([
            this.uniqueConnectionStore.get('previous'),
            this.uniqueConnectionStore.get('current'),
            this.uniqueConnectionStore.get('previousFrontend'),
            this.uniqueConnectionStore.get('currentFrontend'),
            this.uniqueConnectionStore.get('previousBackend'),
            this.uniqueConnectionStore.get('currentBackend'),
        ]);
        const previousHll = HyperLogLog(REGISTERS_EXPONENT);
        if (previous) {
            previousHll.merge({ n: REGISTERS_EXPONENT, buckets: previous.hll });
        }
        const currentHll = HyperLogLog(REGISTERS_EXPONENT);
        if (current) {
            currentHll.merge({ n: REGISTERS_EXPONENT, buckets: current.hll });
        }
        const previousFrontendHll = HyperLogLog(REGISTERS_EXPONENT);
        if (previousFrontend) {
            previousFrontendHll.merge({
                n: REGISTERS_EXPONENT,
                buckets: previousFrontend.hll,
            });
        }
        const currentFrontendHll = HyperLogLog(REGISTERS_EXPONENT);
        if (currentFrontend) {
            currentFrontendHll.merge({
                n: REGISTERS_EXPONENT,
                buckets: currentFrontend.hll,
            });
        }
        const previousBackendHll = HyperLogLog(REGISTERS_EXPONENT);
        if (previousBackend) {
            previousBackendHll.merge({
                n: REGISTERS_EXPONENT,
                buckets: previousBackend.hll,
            });
        }
        const currentBackendHll = HyperLogLog(REGISTERS_EXPONENT);
        if (currentBackend) {
            currentBackendHll.merge({
                n: REGISTERS_EXPONENT,
                buckets: currentBackend.hll,
            });
        }
        return {
            previous: previousHll.count(),
            current: currentHll.count(),
            previousFrontend: previousFrontendHll.count(),
            currentFrontend: currentFrontendHll.count(),
            previousBackend: previousBackendHll.count(),
            currentBackend: currentBackendHll.count(),
        };
    }
}
