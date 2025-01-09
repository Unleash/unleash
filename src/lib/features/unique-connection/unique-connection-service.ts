import type { IUnleashConfig } from '../../types/option';
import type { IFlagResolver, IUnleashStores } from '../../types';
import type { Logger } from '../../logger';
import type { IUniqueConnectionStore } from './unique-connection-store-type';
import HyperLogLog from 'hyperloglog-lite';
import type EventEmitter from 'events';
import { SDK_CONNECTION_ID_RECEIVED } from '../../metric-events';

export class UniqueConnectionService {
    private logger: Logger;

    private uniqueConnectionStore: IUniqueConnectionStore;

    private flagResolver: IFlagResolver;

    private eventBus: EventEmitter;

    private activeHour: number;

    private hll = HyperLogLog(12);

    constructor(
        {
            uniqueConnectionStore,
        }: Pick<IUnleashStores, 'uniqueConnectionStore'>,
        config: IUnleashConfig,
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

    async count(connectionId: string) {
        if (!this.flagResolver.isEnabled('uniqueSdkTracking')) return;
        this.hll.add(HyperLogLog.hash(connectionId));
    }

    async sync(): Promise<void> {
        if (!this.flagResolver.isEnabled('uniqueSdkTracking')) return;
        const currentHour = new Date().getHours();
        const currentBucket = await this.uniqueConnectionStore.get('current');
        if (this.activeHour !== currentHour && currentBucket) {
            if (currentBucket.updatedAt.getHours() < currentHour) {
                this.hll.merge({ n: 12, buckets: currentBucket.hll });
                await this.uniqueConnectionStore.insert({
                    hll: this.hll.output().buckets,
                    id: 'previous',
                });
            } else {
                const previousBucket =
                    await this.uniqueConnectionStore.get('previous');
                this.hll.merge({ n: 12, buckets: previousBucket });
                await this.uniqueConnectionStore.insert({
                    hll: this.hll.output().buckets,
                    id: 'previous',
                });
            }
            this.activeHour = currentHour;

            this.hll = HyperLogLog(12);
        } else {
            if (currentBucket) {
                this.hll.merge({ n: 12, buckets: currentBucket });
            }
            await this.uniqueConnectionStore.insert({
                hll: this.hll.output().buckets,
                id: 'current',
            });
        }
    }
}
