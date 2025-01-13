import type { IUnleashConfig } from '../../types/option';
import type { IFlagResolver, IUnleashStores } from '../../types';
import type { Logger } from '../../logger';
import type { IUniqueConnectionStore } from './unique-connection-store-type';
import HyperLogLog from 'hyperloglog-lite';
import type EventEmitter from 'events';
import { SDK_CONNECTION_ID_RECEIVED } from '../../metric-events';

// HyperLogLog will create 2^n registers
const n = 12;

export class UniqueConnectionService {
    private logger: Logger;

    private uniqueConnectionStore: IUniqueConnectionStore;

    private flagResolver: IFlagResolver;

    private eventBus: EventEmitter;

    private activeHour: number;

    private hll = HyperLogLog(n);

    constructor(
        {
            uniqueConnectionStore,
        }: Pick<IUnleashStores, 'uniqueConnectionStore'>,
        config: Pick<IUnleashConfig, 'getLogger' | 'flagResolver' | 'eventBus'>,
    ) {
        this.uniqueConnectionStore = uniqueConnectionStore;
        this.logger = config.getLogger('services/unique-connection-service.ts');
        this.flagResolver = config.flagResolver;
        this.eventBus = config.eventBus;
        this.activeHour = new Date().getHours();
    }

    listen() {
        this.eventBus.on(SDK_CONNECTION_ID_RECEIVED, this.count.bind(this));
    }

    count(connectionId: string) {
        if (!this.flagResolver.isEnabled('uniqueSdkTracking')) return;
        this.hll.add(HyperLogLog.hash(connectionId));
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

    async sync(currentTime = new Date()): Promise<void> {
        if (!this.flagResolver.isEnabled('uniqueSdkTracking')) return;

        const currentHour = currentTime.getHours();
        const currentBucket = await this.uniqueConnectionStore.get('current');

        if (this.activeHour !== currentHour && currentBucket) {
            if (currentBucket.updatedAt.getHours() < currentHour) {
                this.hll.merge({ n, buckets: currentBucket.hll });
                await this.uniqueConnectionStore.insert({
                    hll: this.hll.output().buckets,
                    id: 'previous',
                });
            } else {
                const previousBucket =
                    await this.uniqueConnectionStore.get('previous');
                if (previousBucket) {
                    this.hll.merge({ n, buckets: previousBucket.hll });
                }
                await this.uniqueConnectionStore.insert({
                    hll: this.hll.output().buckets,
                    id: 'previous',
                });
            }

            this.activeHour = currentHour;
            this.hll = HyperLogLog(n);
        } else if (currentBucket) {
            this.hll.merge({ n, buckets: currentBucket.hll });
        }

        await this.uniqueConnectionStore.insert({
            hll: this.hll.output().buckets,
            id: 'current',
        });
    }
}
