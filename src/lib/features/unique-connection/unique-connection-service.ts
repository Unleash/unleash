import type { IUnleashConfig } from '../../types/option.js';
import type { IFlagResolver, IUnleashStores } from '../../types/index.js';
import type {
    BucketId,
    IUniqueConnectionStore,
} from './unique-connection-store-type.js';
import HyperLogLog from 'hyperloglog-lite';
import type EventEmitter from 'events';
import { SDK_CONNECTION_ID_RECEIVED } from '../../metric-events.js';
import { REGISTERS_EXPONENT } from './hyperloglog-config.js';

export class UniqueConnectionService {
    private uniqueConnectionStore: IUniqueConnectionStore;

    private flagResolver: IFlagResolver;

    private eventBus: EventEmitter;

    private activeHour: number;

    private hll = HyperLogLog(REGISTERS_EXPONENT);

    private backendHll = HyperLogLog(REGISTERS_EXPONENT);

    private frontendHll = HyperLogLog(REGISTERS_EXPONENT);

    constructor(
        {
            uniqueConnectionStore,
        }: Pick<IUnleashStores, 'uniqueConnectionStore'>,
        config: Pick<IUnleashConfig, 'getLogger' | 'flagResolver' | 'eventBus'>,
    ) {
        this.uniqueConnectionStore = uniqueConnectionStore;
        this.flagResolver = config.flagResolver;
        this.eventBus = config.eventBus;
        this.activeHour = new Date().getHours();
    }

    listen() {
        this.eventBus.on(SDK_CONNECTION_ID_RECEIVED, this.count.bind(this));
    }

    count({
        connectionId,
        type,
    }: {
        connectionId: string;
        type: 'frontend' | 'backend';
    }) {
        if (!this.flagResolver.isEnabled('uniqueSdkTracking')) return;
        const value = HyperLogLog.hash(connectionId);
        this.hll.add(value);
        if (type === 'frontend') {
            this.frontendHll.add(value);
        } else if (type === 'backend') {
            this.backendHll.add(value);
        }
    }

    async sync(currentTime = new Date()): Promise<void> {
        if (!this.flagResolver.isEnabled('uniqueSdkTracking')) return;

        const currentHour = currentTime.getHours();

        await this.syncBuckets(currentTime, 'current', 'previous');
        await this.syncBuckets(
            currentTime,
            'currentBackend',
            'previousBackend',
        );
        await this.syncBuckets(
            currentTime,
            'currentFrontend',
            'previousFrontend',
        );

        if (this.activeHour !== currentHour) {
            this.activeHour = currentHour;
        }
    }

    private resetHll(bucketId: BucketId) {
        if (bucketId.toLowerCase().includes('frontend')) {
            this.frontendHll = HyperLogLog(REGISTERS_EXPONENT);
        } else if (bucketId.toLowerCase().includes('backend')) {
            this.backendHll = HyperLogLog(REGISTERS_EXPONENT);
        } else {
            this.hll = HyperLogLog(REGISTERS_EXPONENT);
        }
    }

    private getHll(bucketId: BucketId) {
        if (bucketId.toLowerCase().includes('frontend')) {
            return this.frontendHll;
        } else if (bucketId.toLowerCase().includes('backend')) {
            return this.backendHll;
        } else {
            return this.hll;
        }
    }

    private async syncBuckets(
        currentTime: Date,
        current: BucketId,
        previous: BucketId,
    ): Promise<void> {
        const currentHour = currentTime.getHours();
        const currentBucket = await this.uniqueConnectionStore.get(current);

        if (this.activeHour !== currentHour && currentBucket) {
            if (currentBucket.updatedAt.getHours() < currentHour) {
                this.getHll(current).merge({
                    n: REGISTERS_EXPONENT,
                    buckets: currentBucket.hll,
                });
                await this.uniqueConnectionStore.insert({
                    hll: this.getHll(current).output().buckets,
                    id: previous,
                });
            } else {
                const previousBucket =
                    await this.uniqueConnectionStore.get(previous);
                if (previousBucket) {
                    this.getHll(current).merge({
                        n: REGISTERS_EXPONENT,
                        buckets: previousBucket.hll,
                    });
                }
                await this.uniqueConnectionStore.insert({
                    hll: this.getHll(current).output().buckets,
                    id: previous,
                });
            }

            this.resetHll(current);
        } else if (currentBucket) {
            this.getHll(current).merge({
                n: REGISTERS_EXPONENT,
                buckets: currentBucket.hll,
            });
        }

        await this.uniqueConnectionStore.insert({
            hll: this.getHll(current).output().buckets,
            id: current,
        });
    }
}
